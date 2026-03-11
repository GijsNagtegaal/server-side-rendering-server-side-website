import express from 'express'
import { Liquid } from 'liquidjs'

const app = express()

// Config the server
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// liquid setup
const engine = new Liquid()
app.engine('liquid', engine.express())
app.set('views', './views')
app.set('view engine', 'liquid')

// middleware for keeping track of current path and referrer
app.use((req, res, next) => {
    res.locals.current_path = req.path || '/'
    res.locals.previous_path = req.get('Referrer') || '/'
    next()
})

// dummy data
const quests_data = {
    'items': [
        { 
            'id': 1, 
            'title': 'Opdracht 1', 
            'name': 'Zoeken', 
            'image': '/assets/images/welcome.webp',
            'slug': 'opdracht-1', 
            'plant_id': 1, 
            'zones': [1, 2],
            'xp': 25, 
            'type': 'button',
            'description': 'De Teunisbloem opent zijn bloemen pas in de avondschemering.',
            'question_title': 'Vorm van de bloem',
            'question_text': 'Kijk goed naar de geopende bloem. Welke vorm herken je in de kroonbladeren?',
            'options': [
                { 'label': 'Hartvormig', 'value': 'hart' },
                { 'label': 'Rond', 'value': 'rond' },
                { 'label': 'Puntig', 'value': 'punt' }
            ],
            'correct_answer': 'hart'
        },
        { 
            'id': 2, 
            'title': 'Opdracht 2', 
            'name': 'Herkennen', 
            'image': '/assets/images/welcome.webp',
            'slug': 'opdracht-2', 
            'plant_id': 2, 
            'zones': [3], 
            'xp': 30, 
            'type': 'image',
            'description': 'De Gele Lis staat graag met zijn voeten in het water.',
            'question_title': 'Bladvorm check',
            'question_text': 'Welke van deze afbeeldingen toont de echte zwaardvormige bladeren?',
            'options': [
                { 'image_url': '/assets/images/alium.webp', 'value': 'zwaard' },
                { 'image_url': '/assets/images/alium.webp', 'value': 'rond' }
            ],
            'correct_answer': 'zwaard'
        },
        { 
            'id': 3, 
            'title': 'Opdracht 3', 
            'name': 'Ruiken', 
            'image': '/assets/images/welcome.webp',
            'slug': 'opdracht-3', 
            'plant_id': 3, 
            'zones': [1, 2, 3], 
            'xp': 20, 
            'type': 'button',
            'description': 'Lavendel trekt veel bijen en vlinders aan door zijn sterke geur.',
            'question_title': 'De geur-ervaring',
            'question_text': 'Wrijf zachtjes over de bloem. Waar doet deze geur je aan denken?',
            'options': [
                { 'label': 'Frisse zeep', 'value': 'zeep' },
                { 'label': 'Rotten eieren', 'value': 'rot' },
                { 'label': 'Vers gemaaid gras', 'value': 'gras' }
            ],
            'correct_answer': 'zeep'
        },
        { 
            'id': 4, 
            'title': 'Opdracht 4', 
            'name': 'Tellen', 
            'image': '/assets/images/welcome.webp',
            'slug': 'opdracht-4', 
            'plant_id': 4, 
            'zones': [1], 
            'xp': 25, 
            'type': 'button',
            'description': 'De Wilde Aardbei heeft kleine witte bloemetjes met een geel hart.',
            'question_title': 'Bloemblaadjes',
            'question_text': 'Hoeveel witte kroonblaadjes heeft één bloem van de Wilde Aardbei?',
            'options': [
                { 'label': '4 blaadjes', 'value': '4' },
                { 'label': '5 blaadjes', 'value': '5' },
                { 'label': '6 blaadjes', 'value': '6' }
            ],
            'correct_answer': '5'
        },
        { 
            'id': 5, 
            'title': 'Opdracht 5', 
            'name': 'Voelen', 
            'image': '/assets/images/welcome.webp',
            'slug': 'opdracht-5', 
            'plant_id': 5, 
            'zones': [2], 
            'xp': 35, 
            'type': 'image',
            'description': 'De Gewone Vlier heeft takken die van binnen zacht zijn.',
            'question_title': 'Takstructuur',
            'question_text': 'Welke foto laat de bast van een oudere Vlierstruik zien?',
            'options': [
                { 'image_url': '/assets/images/alium.webp', 'value': 'kurk' },
                { 'image_url': '/assets/images/alium.webp', 'value': 'glad' }
            ],
            'correct_answer': 'kurk'
        },
        { 
            'id': 6, 
            'title': 'Opdracht 6', 
            'name': 'Kijken', 
            'image': '/assets/images/welcome.webp',
            'slug': 'opdracht-6', 
            'plant_id': 6, 
            'zones': [1, 3], 
            'xp': 20, 
            'type': 'button',
            'description': 'De Brandnetel heeft haartjes die kunnen prikken.',
            'question_title': 'De stengel',
            'question_text': 'Kijk naar de stengel. Welke vorm heeft de doorsnede?',
            'options': [
                { 'label': 'Rond', 'value': 'rond' },
                { 'label': 'Vierkant', 'value': 'vierkant' }
            ],
            'correct_answer': 'vierkant'
        },
        { 
            'id': 7, 
            'title': 'Opdracht 7', 
            'name': 'Smaak', 
            'image': '/assets/images/welcome.webp',
            'slug': 'opdracht-7', 
            'plant_id': 7, 
            'zones': [2], 
            'xp': 40, 
            'type': 'button',
            'description': 'Zuring smaakt heel fris en een beetje zuur.',
            'question_title': 'Bladvorm',
            'question_text': 'Hoe ziet de onderkant van het blad eruit bij de stengel?',
            'options': [
                { 'label': 'In een puntje', 'value': 'punt' },
                { 'label': 'Met twee oortjes', 'value': 'oren' },
                { 'label': 'Helemaal recht', 'value': 'recht' }
            ],
            'correct_answer': 'oren'
        },
        { 
            'id': 8, 
            'title': 'Opdracht 8', 
            'name': 'Zoeken', 
            'image': '/assets/images/welcome.webp',
            'slug': 'opdracht-8', 
            'plant_id': 8, 
            'zones': [1, 2, 3], 
            'xp': 15, 
            'type': 'image',
            'description': 'Madeliefjes groeien vaak in het kort gemaaide gras.',
            'question_title': 'Kleur bekennen',
            'question_text': 'Welke kleur hebben de tipjes van de blaadjes vaak?',
            'options': [
                { 'image_url': '/assets/images/alium.webp', 'value': 'roze' },
                { 'image_url': '/assets/images/alium.webp', 'value': 'blauw' }
            ],
            'correct_answer': 'roze'
        },
        { 
            'id': 9, 
            'title': 'Opdracht 9', 
            'name': 'Onderzoek', 
            'image': '/assets/images/welcome.webp',
            'slug': 'opdracht-9', 
            'plant_id': 9, 
            'zones': [3], 
            'xp': 30, 
            'type': 'button',
            'description': 'De Grote Lisdodde wordt ook wel sigarenplant genoemd.',
            'question_title': 'De sigaar',
            'question_text': 'Hoe voelt de bruine sigaar aan als je er in knijpt?',
            'options': [
                { 'label': 'Zacht en verend', 'value': 'zacht' },
                { 'label': 'Keihard als hout', 'value': 'hard' },
                { 'label': 'Plakkerig', 'value': 'plak' }
            ],
            'correct_answer': 'zacht'
        },
        { 
            'id': 10, 
            'title': 'Opdracht 10', 
            'name': 'Determinatie', 
            'image': '/assets/images/welcome.webp',
            'slug': 'opdracht-10', 
            'plant_id': 10, 
            'zones': [1], 
            'xp': 50, 
            'type': 'image',
            'description': 'De Paardenbloem verandert na de bloei in een pluizenbol.',
            'question_title': 'Bladrand',
            'question_text': 'Welke van deze bladeren heeft de diep ingesneden tanden?',
            'options': [
                { 'image_url': '/assets/images/alium.webp', 'value': 'tand' },
                { 'image_url': '/assets/images/alium.webp', 'value': 'glad' },
                { 'image_url': '/assets/images/alium.webp', 'value': 'lob' }
            ],
            'correct_answer': 'tand'
        }
    ]
}

// Routes

// welcome
app.get('/welcome', (req, res) => res.render('welcome.liquid'))

// Home
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
        const matched_zone = zones_json.data.find(zone => zone.id === plant.zones[0])
        return { ...plant, main_zone: matched_zone }
    })

    res.render('index.liquid', { zones: zones_json.data, plants: plants_with_zones, news: news_json.data, zone_type: 'home' })
})

// Map 
app.get('/veldverkenner', async (req, res) => {
    const zones_res = await fetch('https://fdnd-agency.directus.app/items/frankendael_zones')
    const zones_json = await zones_res.json()
    res.render('veldverkenner.liquid', { zones: zones_json.data })
})

// Zone detail
app.get('/veldverkenner/:zone_slug', async (req, res, next) => {
    const { zone_slug } = req.params
    try {
        const zone_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_zones?filter[slug][_eq]=${zone_slug}`)
        const zone_json = await zone_res.json()
        const zone_item = zone_json.data[0]

        if (!zone_item) return next()

        let plants_items = []
        if (zone_item.plants && zone_item.plants.length > 0) {
            const plant_ids = zone_item.plants.join(',')
            const plant_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_plants?filter[id][_in]=${plant_ids}`)
            const plant_json = await plant_res.json()
            plants_items = plant_json.data
        }

        const plants_with_quests = plants_items.map(plant => {
            const associated_quest = quests_data.items.find(quest => quest.plant_id === plant.id)
            return { ...plant, quest: associated_quest || null }
        })

        const filtered_quests = quests_data.items.filter(quest => quest.zones.includes(zone_item.id))

        res.render('zone.liquid', {
            zone: zone_item,
            plants: plants_with_quests,
            quests: filtered_quests,
            zone_slug: zone_slug,
            zone_type: zone_item.type
        })
    } catch (error) {
        res.status(500).send('fout bij laden zone')
    }
})

// Plant / quest detail
app.get('/veldverkenner/:zone_slug/:item_slug', async (req, res, next) => {
    const { zone_slug, item_slug } = req.params
    const { step } = req.query 

    try {
        const zone_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_zones?filter[slug][_eq]=${zone_slug}`)
        const zone_json = await zone_res.json()
        const zone_item = zone_json.data[0]

        if (!zone_item) return next()

        const quest_item = quests_data.items.find(quest => quest.slug === item_slug)
        
        if (quest_item) {
            const currentStep = step || 'intro'
            return res.render('opdracht.liquid', {
                quest: quest_item,
                zone: zone_item,
                zone_slug: zone_slug,
                zone_type: zone_item.type,
                state: currentStep 
            })
        }

        const plant_res = await fetch(`https://fdnd-agency.directus.app/items/frankendael_plants?filter[slug][_eq]=${item_slug}`)
        const plant_json = await plant_res.json()
        const plant_item = plant_json.data[0]

        if (plant_item) {
            return res.render('plant-detail.liquid', {
                plant: plant_item,
                zone: zone_item,
                zone_slug: zone_slug
            })
        }

        next()
    } catch (error) {
        res.status(500).send('Server fout')
    }
})

// News
app.get('/nieuws', async (req, res) => {
    const news_res = await fetch('https://fdnd-agency.directus.app/items/frankendael_news')
    const news_json = await news_res.json()
    res.render('nieuws.liquid', { news: news_json.data })
})

// Collection
app.get('/collectie', async (req, res) => {
    const [plants_res, zones_res] = await Promise.all([
        fetch('https://fdnd-agency.directus.app/items/frankendael_plants'),
        fetch('https://fdnd-agency.directus.app/items/frankendael_zones')
    ])
    const plants_json = await plants_res.json()
    const zones_json = await zones_res.json()

    const plants_with_zones = plants_json.data.map(plant => {
        const matched_zone = zones_json.data.find(zone => zone.id === (plant.zones ? plant.zones[0] : null))
        return { ...plant, main_zone: matched_zone }
    })
    res.render('collectie.liquid', { plants: plants_with_zones, zone_type: 'collectie' })
})



// all other routes 404
app.use((req, res) => {
    res.status(404).render('404.liquid')
})

app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), () => {
    console.log(`started on http://localhost:${app.get('port')}`)
})