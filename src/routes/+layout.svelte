<script>
	import './global.css';
	import { Client, setContextClient, cacheExchange, fetchExchange } from '@urql/svelte';
	import { limitExchange } from "$lib/limitExchange.ts"

	const client = new Client({
	  url: 'https://graphql-pokeapi.graphcdn.app/',
	  exchanges: [cacheExchange, limitExchange(2), fetchExchange],
	});

	setContextClient(client);
</script>

<a href="/">home</a>
<a href="randompokemon">randompokemon</a>

<br />
<br />

<slot />
