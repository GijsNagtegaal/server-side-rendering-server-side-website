// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';


console.log('Hieronder moet je waarschijnlijk nog wat veranderen')
// Doe een fetch naar de data die je nodig hebt
// const apiResponse = await fetch('...')

// Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
// const apiResponseJSON = await apiResponse.json()

// Controleer eventueel de data in je console
// (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
// console.log(apiResponseJSON)


// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()


// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({extended: true}))

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))
app.use((request, response, next) => {
    // We use || '/' to ensure it's never an empty string
    response.locals.current_path = request.path || '/';
    next();
});

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express()); 

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')
app.set('view engine', 'liquid')

app.get('/welcome', async function (request, response) {
    // Render index.liquid uit de Views map
    // Geef hier eventueel data aan mee
    response.render('welcome.liquid', {
        current_path: request.path
    });
})

// Maak een GET route voor de index (meestal doe je dit in de root, als /)
app.get('/', async function (request, response) {
    // Render index.liquid uit de Views map
    // Geef hier eventueel data aan mee
    const zones = await fetch('https://fdnd-agency.directus.app/items/frankendael_zones');
    const zonesresult = await zones.json();
    const plants = await fetch('https://fdnd-agency.directus.app/items/frankendael_plants');
    const plantsresult = await plants.json();
    const news = await fetch('https://fdnd-agency.directus.app/items/frankendael_news');
    const newsResult = await news.json();
    
    response.render('index.liquid', {
        zones: zonesresult.data,
        plants: plantsresult.data,
        news: newsResult.data,
    });
})


app.get('/veldverkenner', async function (request, response) {
    try {
        const res = await fetch('https://fdnd-agency.directus.app/items/frankendael_zones');
        const result = await res.json();
        
        response.render('veldverkenner.liquid', {
            zones: result.data
        });
    } catch (error) {
        response.render('veldverkenner.liquid', { zones: [] });
    } 
});

app.get('/veldverkenner/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        // 1. Fetch from Directus using the slug filter
        const response = await fetch(`https://fdnd-agency.directus.app/items/frankendael_zones?filter[slug][_eq]=${slug}`);
        const result = await response.json();

        // get zone object from the data array
        const zone = result.data ? result.data[0] : null;

        // If no zone was found, return to a 404
        if (!zone) {
            return res.status(404).send('Zone not found');
        }

        // Fetch plants if the zone has IDs in the array
        if (zone.plants && zone.plants.length > 0) {
            const ids = zone.plants.join(',');
            const plantRes = await fetch(`https://fdnd-agency.directus.app/items/frankendael_plants?filter[id][_in]=${ids}`);
            const plantData = await plantRes.json();
            
            zone.plants = plantData.data || [];
        } else {
            zone.plants = [];
        }

        // 5. Render the liquid template
        res.render('zone.liquid', { 
            zone: zone 
        });

    } catch (error) {
        console.error("Error fetching zone:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/veldverkenner/:zoneSlug/:itemSlug', async (req, res) => {
    const { zoneSlug, itemSlug } = req.params;

    try {
        // 1. Zoek eerst in de planten collectie op basis van de itemSlug
        const plantResponse = await fetch(`https://fdnd-agency.directus.app/items/frankendael_plants?filter[slug][_eq]=${itemSlug}`);
        const plantResult = await plantResponse.json();

        // Als er een plant is gevonden, render de plant detail pagina
        if (plantResult.data && plantResult.data.length > 0) {
            return res.render('plant-detail.liquid', { 
                plant: plantResult.data[0],
                zoneSlug: zoneSlug 
            });
        }

        // 2. Als er geen plant is, zoek dan in de opdrachten collectie
        // Let op: vervang 'frankendael_assignments' door de echte naam van je opdrachten tabel
        const assignmentResponse = await fetch(`https://fdnd-agency.directus.app/items/frankendael_assignments?filter[slug][_eq]=${itemSlug}`);
        const assignmentResult = await assignmentResponse.json();

        if (assignmentResult.data && assignmentResult.data.length > 0) {
            return res.render('opdracht.liquid', { 
                assignment: assignmentResult.data[0],
                zoneSlug: zoneSlug 
            });
        }

        // 3. Als beide niet gevonden zijn: 404
        res.status(404).send('Pagina niet gevonden');

    } catch (error) {
        console.error("Fout bij ophalen detail data:", error);
        res.status(500).send('Interne server fout');
    }
});

app.get('/nieuws', async function (request, response) {
    // Render nieuws.liquid uit de Views map
    // Geef hier eventueel data aan mee
    const news = await fetch('https://fdnd-agency.directus.app/items/frankendael_news');
    const newsResult = await news.json();
    
    response.render('nieuws.liquid', {
        news: newsResult.data,
    });

    console.log(newsResult)
})

app.get('/collectie', async function (request, response) {
    // Render index.liquid uit de Views map
    // Geef hier eventueel data aan mee
    const plants = await fetch('https://fdnd-agency.directus.app/items/frankendael_plants');
    const plantsresult = await plants.json();
    
    response.render('collectie.liquid', {
        plants: plantsresult.data,
    });
})

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
// Hier doen we nu nog niets mee, maar je kunt er mee spelen als je wilt
app.post('/', async function (request, response) {
  // Je zou hier data kunnen opslaan, of veranderen, of wat je maar wilt
  // Er is nog geen afhandeling van een POST, dus stuur de bezoeker terug naar /
    response.redirect(303, '/')
})

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})
