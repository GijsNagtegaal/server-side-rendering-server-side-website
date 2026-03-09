import express from 'express'
import { Liquid } from 'liquidjs'

const app = express()

// CONFIGURATIE VAN DE SERVER EN STATIC FILES
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// INSTELEN VAN DE LIQUID ENGINE VOOR DE VIEWS
const engine = new Liquid()
app.engine('liquid', engine.express())
app.set('views', './views')
app.set('view engine', 'liquid')

// MIDDLEWARE VOOR HET BIJHOUDEN VAN HET HUIDIGE PAD EN DE REFERER
app.use((req, res, next) => {
    res.locals.current_path = req.path || '/'
    res.locals.previous_path = req.get('Referrer') || '/'
    next()
})

// DUMMY DATA VOOR DE OPDRACHTEN DIE GEKOPPELD ZIJN AAN ZONES
const quests_data = {
    "items": [
        {
            "id": 1,
            "name": "teunisbloem check",
            "slug": "opdracht-1",
            "description": "de teunisbloem staat bekend om zijn prachtige gele bloemen.",
            "zones": [1, 2] 
        },
        {
            "id": 2,
            "name": "sneeuwklokjes zoeken",
            "slug": "opdracht-2",
            "description": "zoek naar de witte klokvormige bloemetjes.",
            "zones": [3]
        }
    ]
}

// ROUTE VOOR DE HOMEPAGINA MET ZONES, PLANTEN EN NIEUWS
app.get('/', async (req, res) => {
    const [zones_res, plants_res, news_res] = await Promise.all([
        fetch('https://fdnd-agency.directus.app/items/frankendael_zones'),
        fetch('https://fdnd-agency.directus.app/items/frankendael_plants'),
        fetch('https://fdnd-agency.directus.app/items/frankendael_news')
    ])

    const zones_json = await zones_res.json()
    const plants_json = await plants_res.json()
    const news_json = await news_res.json()

    // KOPPEL DE ZONE DATA AAN DE PLANTEN VOOR HET OVERZICHT
    const plants_with_zones = plants_json.data.map(plant => {
        const first_zone_id = plant.zones[0]
        const matched_zone = zones_json.data.find(zone => zone.id === first_zone_id)
        return {
            ...plant,
            main_zone: matched_zone || { type: 'default' }
        }
    })

    res.render('index.liquid', {
        zones: zones_json.data,
        plants: plants_with_zones,
        news: news_json.data,
        zone_type: 'home'
    })
})

// ROUTE VOOR HET NIEUWS OVERZICHT
app.get('/nieuws', async (req, res) => {
    const news_res = await fetch('https://fdnd-agency.directus.app/items/frankendael_news')
    const news_json = await news_res.json()
    
    res.render('nieuws.liquid', {
        news: news_json.data
    })
})

// ROUTE VOOR DE VOLLEDIGE COLLECTIE VAN PLANTEN
app.get('/collectie', async (req, res) => {
    const [plants_res, zones_res] = await Promise.all([
        fetch('https://fdnd-agency.directus.app/items/frankendael_plants'),
        fetch('https://fdnd-agency.directus.app/items/frankendael_zones')
    ])

    const plants_json = await plants_res.json()
    const zones_json = await zones_res.json()

    const plants_with_zones = plants_json.data.map(plant => {
        const first_zone_id = plant.zones ? plant.zones[0] : null
        const matched_zone = zones_json.data.find(zone => zone.id === first_zone_id)
        return {
            ...plant,
            main_zone: matched_zone || { type: 'geen-zone', name: 'onbekend' }
        }
    })

    res.render('collectie.liquid', {
        plants: plants_with_zones,
        zone_type: 'collectie'
    })
})

// ROUTE VOOR DE VELDVERKENNER ZONE OVERZICHT
app.get('/veldverkenner', async (req, res) => {
    const zones_res = await fetch('https://fdnd-agency.directus.app/items/frankendael_zones')
    const zones_json = await zones_res.json()
    res.render('veldverkenner.liquid', { 
        zones: zones_json.data 
    })
})

// ROUTE VOOR DE DETAILPAGINA VAN EEN SPECIFIEKE ZONE
app.get('/veldverkenner/:zone_slug', async (req, res) => {
    const { zone_slug } = req.params

    try {
        const zone_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_zones?filter[slug][_eq]=${zone_slug}`)
        const zone_json = await zone_res.json()
        const zone_item = zone_json.data[0]

        if (!zone_item) return res.status(404).send('zone niet gevonden')

        let plants_items = []
        if (zone_item.plants && zone_item.plants.length > 0) {
            const plant_ids = zone_item.plants.join(',')
            const plant_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_plants?filter[id][_in]=${plant_ids}`)
            const plant_json = await plant_res.json()
            plants_items = plant_json.data
        }

        const filtered_quests = quests_data.items.filter(quest => quest.zones.includes(zone_item.id))

        res.render('zone.liquid', {
            zone: zone_item,
            plants: plants_items,
            quests: filtered_quests,
            zone_slug: zone_slug
        })
    } catch (error) {
        res.status(500).send('fout bij laden zone')
    }
})

// ROUTE DIE ZOWEL OPDRACHTEN ALS PLANTEN AFHANDELT OP BASIS VAN DE SLUG
app.get('/veldverkenner/:zone_slug/:item_slug', async (req, res) => {
    const { zone_slug, item_slug } = req.params

    const quest_item = quests_data.items.find(quest => quest.slug === item_slug)
    
    if (quest_item) {
        return res.render('opdracht.liquid', {
            quest: quest_item,
            zone_slug: zone_slug,
            quest_slug: item_slug
        })
    }

    try {
        const plant_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_plants?filter[slug][_eq]=${item_slug}`)
        const plant_json = await plant_res.json()
        const plant_item = plant_json.data[0]

        if (plant_item) {
            return res.render('plant-detail.liquid', {
                plant: plant_item,
                zone_slug: zone_slug
            })
        }

        res.status(404).send('pagina niet gevonden')
    } catch (error) {
        res.status(500).send('server fout')
    }
})

// WELKOM PAGINA
app.get('/welcome', (req, res) => res.render('welcome.liquid'))

// START DE SERVER OP POORT 8000
app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), () => {
    console.log(`started on http://localhost:${app.get('port')}`)
})