<script>
	import {queryStore, getContextClient,gql} from "@urql/svelte"

	export let name;

	$: s = queryStore({
		client: getContextClient(),
		pause: !name,
		query: gql`
		 query pikachu {
			pokemon(name: "${name}") {
				id
			}
		 }
    `,
		requestPolicy: "network-only",
	});
</script>

{#if $s.data}
	<pre>
		{$s.data.pokemon.id}
	</pre>
{/if}