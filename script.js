document.addEventListener('DOMContentLoaded', () => {
    getPokemons(URL);
    getPokemonTypes();

    const h1 = document.querySelector('h1#titulo');
    h1.textContent = 'POKEDEX';
    h1.classList.add('text-center', 'text-info');

    const elements = document.querySelectorAll('#segundo, #searchContainer');
    elements.forEach(element => {
        element.classList.add('text-center');
    });

    const input = document.querySelector('input[type="text"]');
    input.addEventListener('input', function () {
        filterPokemons(input.value.toLowerCase());
    });

    const typeSelect = document.getElementById('typeSelect');
    typeSelect.addEventListener('change', function () {
        filterPokemons(input.value.toLowerCase(), typeSelect.value);
    });
});

const URL = 'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=100';
let allPokemons = [];
let allPokemonTypes = [];
const getPokemons = async (URL) => {
    try {
        const pokemonList = await fetch(URL);
        const pokemonListJSON = await pokemonList.json();
        allPokemons = pokemonListJSON.results;

        // Cargar Pokémon al inicio
        displayPokemonCards(allPokemons);
    } catch (error) {
        console.log(error);
    }
};

const getPokemonTypes = async () => {
    try {
        const typeResponse = await fetch('https://pokeapi.co/api/v2/type/');
        const typeData = await typeResponse.json();

        allPokemonTypes = typeData.results;
        populateTypeDropdown(allPokemonTypes);
    } catch (error) {
        console.log(error);
    }
};

const populateTypeDropdown = (types) => {
    const typeSelect = document.getElementById('typeSelect');
    types.forEach((type) => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
        typeSelect.appendChild(option);
    });
};

const setDataInCard = async (URLdata, row) => {
    try {
        const dataPokemon = await fetch(URLdata);
        const dataPokemonJSON = await dataPokemon.json();

        const col = document.createElement('div');
        col.classList.add('col-md-3');

        const card = document.createElement('div');
        card.classList.add('card', 'pokemon-card');

        const img = document.createElement('img');
        img.src = dataPokemonJSON.sprites.front_default;
        img.classList.add('card-img-top', 'pokemon-image', 'animate__animated', 'animate__flipInX');
        img.addEventListener('mouseover', function () {
            img.classList.remove('animate__flipInX');
            img.classList.add('animate__flip');
        });
        img.addEventListener('mouseout', function () {
            img.classList.remove('animate__flip');
            img.classList.add('animate__flipInX');
        });

        // Añadir la barra de tipo
        const typeBar = document.createElement('div');
        typeBar.classList.add('pokemon-type-bar');
        const types = dataPokemonJSON.types.map((t) => t.type.name).join(', ');
        typeBar.textContent = types;

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = dataPokemonJSON.name;

        const cardText = document.createElement('p');
        cardText.classList.add('card-text');
        cardText.textContent = `Experiencia: ${dataPokemonJSON.base_experience}`;

        const abilitiesText = document.createElement('p');
        abilitiesText.classList.add('card-text', 'pokemon-abilities');
        const abilitiesCount = dataPokemonJSON.abilities.length;
        abilitiesText.textContent = `Habilidades (${abilitiesCount}): ${dataPokemonJSON.abilities
            .map((ability) => ability.ability.name)
            .join(', ')}`;

        // Añadir todos los elementos al cardBody
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        cardBody.appendChild(abilitiesText);

        // Añadir la imagen, barra de tipo y cardBody a la tarjeta
        card.appendChild(img);
        card.appendChild(typeBar); // Añade la barra de tipo antes del cuerpo de la tarjeta
        card.appendChild(cardBody);

        col.appendChild(card);
        row.appendChild(col);
    } catch (error) {
        console.log(error);
    }
};


const filterPokemons = async (searchQuery, selectedType = 'all') => {
    const pokemonCardsContainer = document.querySelector('#pokemon-cards');
    pokemonCardsContainer.innerHTML = '';
    const filteredPokemons = [];

    // Verificar si la búsqueda es un número para filtrar por cantidad de habilidades o experiencia
    const isNumber = !isNaN(searchQuery) && searchQuery.trim() !== '';

    // Filtrar Pokémon por nombre, habilidades, número de habilidades, experiencia y tipo seleccionado
    for (const pokemon of allPokemons) {
        const pokemonData = await fetch(pokemon.url);
        const pokemonDetails = await pokemonData.json();

        const nameMatches = pokemon.name.toLowerCase().includes(searchQuery);
        const abilityMatches = pokemonDetails.abilities.some((ability) =>
            ability.ability.name.toLowerCase().includes(searchQuery)
        );

        // Filtrar por número de habilidades si searchQuery es un número
        const abilityCountMatches = isNumber && pokemonDetails.abilities.length === parseInt(searchQuery);

        // Filtrar por experiencia si searchQuery es un número y coincide parcialmente
        const experienceMatches = isNumber && pokemonDetails.base_experience.toString().includes(searchQuery);

        const typeMatches =
            selectedType === 'all' ||
            pokemonDetails.types.some((type) => type.type.name === selectedType);

        // Agregar Pokémon si coincide con nombre, habilidades, número de habilidades o experiencia
        if ((nameMatches || abilityMatches || abilityCountMatches || experienceMatches) && typeMatches) {
            filteredPokemons.push(pokemon);
        }
    }

    displayPokemonCards(filteredPokemons);
};

const displayPokemonCards = async (pokemons) => {
    const pokemonCardsContainer = document.querySelector('#pokemon-cards');
    pokemonCardsContainer.innerHTML = '';

    let currentIndex = 0;
    const numCardsPerSlide = 4;

    while (currentIndex < pokemons.length) {
        const slide = document.createElement('div');
        slide.classList.add('carousel-item');
        if (currentIndex === 0) slide.classList.add('active');

        const row = document.createElement('div');
        row.classList.add('row');

        for (let i = 0; i < numCardsPerSlide && currentIndex < pokemons.length; i++, currentIndex++) {
            await setDataInCard(pokemons[currentIndex].url, row);
        }

        slide.appendChild(row);
        pokemonCardsContainer.appendChild(slide);
    }
};