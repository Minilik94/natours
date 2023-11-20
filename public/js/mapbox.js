/* eslint-disable */
const mapox = document.getElementById('map')

if (mapox) {
  const locations = JSON.parse(mapox.dataset.locations)
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWluaWxpazk0NiIsImEiOiJjbGx3ZDdhZjYwYnVoM2NvN3RscTlsZTdxIn0.H_5B4eC4vygloW4idl5icA'
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/minilik946/cllz36jey00lm01r7d4ja1wmg',
    scrollZoom: false,
    pitch: 45

    // center: [118.4547, 35.710359],
    // zoom: 4,
    // interactive: false
  })


  const bounds = new mapboxgl.LngLatBounds()

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div')
    el.className = 'marker'

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map)

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map)

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates)
  })

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  })
}
// console.log(locations);
