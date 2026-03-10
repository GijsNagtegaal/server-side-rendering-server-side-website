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

// DUMMY DATA VOOR DE OPDRACHTEN
const quests_data = {
    "items": [
        { 
            "id": 1, 
            "name": "Zoeken", 
            "slug": "opdracht-1", 
            "plant_id": 1, 
            "zones": [1, 2],
            "xp": 25,
            "description": "De Teunisbloem opent zijn bloemen pas in de avondschemering. Kun jij deze gele verschijning vinden tussen het hoge gras?" 
        },
        { 
            "id": 2, 
            "name": "Herkennen", 
            "slug": "opdracht-2", 
            "plant_id": 2, 
            "zones": [3],
            "xp": 30,
            "description": "Kijk goed naar de vorm van de bladeren. De Gele Lis heeft zwaardvormige bladen die hem onderscheiden van andere oeverplanten." 
        },
        { 
            "id": 3, 
            "name": "Zoeken", 
            "slug": "opdracht-3", 
            "plant_id": 3, 
            "zones": [1, 2, 3],
            "xp": 20,
            "description": "Zoek naar de paarse pracht van de Lavendel. Deze plant houdt van zonnige plekken en droge voeten." 
        },
        { 
            "id": 4, 
            "name": "Zoeken", 
            "slug": "opdracht-4", 
            "plant_id": 4, 
            "zones": [1, 2, 3],
            "xp": 25,
            "description": "De Wilde Aardbei verstopt zich vaak laag bij de grond. Kijk onder de grotere bladeren of je de kleine witte bloemetjes ziet." 
        },
        { 
            "id": 5, 
            "name": "Ruiken", 
            "slug": "opdracht-5", 
            "plant_id": 5, 
            "zones": [1, 2, 3],
            "xp": 35,
            "description": "Wrijf voorzichtig over een blaadje van de Gewone Vlier. Herken je de sterke, herkenbare geur van de natuurlijke limonade?" 
        }
    ]
}
// ROUTE VOOR DE HOMEPAGINA
app.get('/', async (req, res) => {
    const [zones_res, plants_res, news_res] = await Promise.all([
        fetch('https://fdnd-agency.directus.app/items/frankendael_zones'),
        fetch('https://fdnd-agency.directus.app/items/frankendael_plants'),
        fetch('https://fdnd-agency.directus.app/items/frankendael_news')
    ])

    const zones_json = await zones_res.json()
    const plants_json = await plants_res.json()
    const news_json = await news_res.json()

    const plants_with_zones = plants_json.data.map(plant => {
        const first_zone_id = plant.zones[0]
        const matched_zone = zones_json.data.find(zone => zone.id === first_zone_id)
        return {
            ...plant,
            main_zone: matched_zone
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
    res.render('nieuws.liquid', { news: news_json.data })
})

// ROUTE VOOR DE VOLLEDIGE COLLECTIE
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
            main_zone: matched_zone
        }
    })

    res.render('collectie.liquid', {
        plants: plants_with_zones,
        zone_type: 'collectie'
    })
})

// ROUTE VOOR DE VELDVERKENNER OVERZICHT
app.get('/veldverkenner', async (req, res) => {
    const zones_res = await fetch('https://fdnd-agency.directus.app/items/frankendael_zones')
    const zones_json = await zones_res.json()
    res.render('veldverkenner.liquid', { zones: zones_json.data })
})

// ROUTE VOOR DE DETAILPAGINA VAN EEN SPECIFIEKE ZONE
app.get('/veldverkenner/:zone_slug', async (req, res) => {
    const { zone_slug } = req.params

    try {
        // 1. Fetch the zone based on the slug
        const zone_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_zones?filter[slug][_eq]=${zone_slug}`)
        const zone_json = await zone_res.json()
        const zone_item = zone_json.data[0]

        if (!zone_item) return res.status(404).send('zone niet gevonden')

        let plants_items = []
        
        // 2. Fetch plants belonging to this zone
        if (zone_item.plants && zone_item.plants.length > 0) {
            const plant_ids = zone_item.plants.join(',')
            const plant_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_plants?filter[id][_in]=${plant_ids}`)
            const plant_json = await plant_res.json()
            plants_items = plant_json.data
        }

        // 3. ENRICH PLANTS WITH QUESTS
        // We look through each plant and find the quest that has the matching plant_id
        const plants_with_quests = plants_items.map(plant => {
            const associated_quest = quests_data.items.find(quest => quest.plant_id === plant.id)
            
            return {
                ...plant,
                quest: associated_quest || null // Add the quest object directly to the plant
            }
        })

        // 4. Still filter quests for the zone if you need them separately in the UI
        const filtered_quests = quests_data.items.filter(quest => quest.zones.includes(zone_item.id))

        res.render('zone.liquid', {
            zone: zone_item,
            plants: plants_with_quests, // Send the enriched plants!
            quests: filtered_quests,
            zone_slug: zone_slug,
            zone_type: zone_item.type
        })
    } catch (error) {
        console.error(error)
        res.status(500).send('fout bij laden zone')
    }
})

// ROUTE VOOR OPDRACHTEN EN PLANTEN MET ZONE-CONTEXT
app.get('/veldverkenner/:zone_slug/:item_slug', async (req, res) => {
    const { zone_slug, item_slug } = req.params

    try {
        const zone_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_zones?filter[slug][_eq]=${zone_slug}`)
        const zone_json = await zone_res.json()
        const zone_item = zone_json.data[0]

        if (!zone_item) return res.status(404).send('zone niet gevonden')
        
        const current_zone_type = zone_item.type

        // Check voor opdracht
        const quest_item = quests_data.items.find(quest => quest.slug === item_slug)
        if (quest_item) {
            return res.render('opdracht.liquid', {
                quest: quest_item,
                zone_slug: zone_slug,
                zone_type: current_zone_type,
                quest_slug: item_slug
            })
        }

        // Check voor plant
        const plant_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_plants?filter[slug][_eq]=${item_slug}`)
        const plant_json = await plant_res.json()
        const plant_item = plant_json.data[0]

        if (plant_item) {
            return res.render('plant-detail.liquid', {
                plant: plant_item,
                zone_slug: zone_slug,
                zone_type: current_zone_type
            })
        }

        res.status(404).send('pagina niet gevonden')
    } catch (error) {
        res.status(500).send('server fout')
    }
})

app.get('/welcome', (req, res) => res.render('welcome.liquid'))

app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), () => {
    console.log(`started on http://localhost:${app.get('port')}`)
})