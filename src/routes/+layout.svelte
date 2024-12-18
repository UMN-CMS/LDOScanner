<script lang="ts">
    import 'bulma/css/bulma.css';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>


{@render children?.()}
