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
    response.locals.current_path = request.path;
    next();
});

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express()); 

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')
app.set('view engine', 'liquid')
// Maak een GET route voor de index (meestal doe je dit in de root, als /)
app.get('/', async function (request, response) {
    // Render index.liquid uit de Views map
    // Geef hier eventueel data aan mee
    response.render('index.liquid')
})

app.get('/welcome', async function (request, response) {
    // Render index.liquid uit de Views map
    // Geef hier eventueel data aan mee
    response.render('welcome.liquid')
})

app.get('/veldverkenner', async function (request, response) {
    // Render index.liquid uit de Views map
    // Geef hier eventueel data aan mee
    response.render('veldverkenner.liquid')
})

app.get('/zone/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Fetch the Zone data first
        const zoneRes = await fetch(`https://fdnd-agency.directus.app/items/frankendael_zones/${id}`);
        const zoneData = await zoneRes.json();
        const zone = zoneData.data;

        // 2. Check if the zone has any plant IDs
        if (zone.plants && zone.plants.length > 0) {
            // Join IDs for the URL: [1, 5] becomes "1,5"
            const ids = zone.plants.join(',');
            
            // 3. Fetch plants that match those specific IDs
            const plantRes = await fetch(`https://fdnd-agency.directus.app/items/frankendael_plants?filter[id][_in]=${ids}`);
            const plantData = await plantRes.json();
            
            // Replace the array of numbers with the actual plant objects
            zone.plants = plantData.data;
        } else {
            // If no plants, make sure it's an empty list so Liquid doesn't break
            zone.plants = [];
        }

        // 4. Render the template
        res.render('zone.liquid', { 
            zone: zone 
        });

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).send('Internal Server Error');
    }
});
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
