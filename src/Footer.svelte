<script>
    let year = new Date().getFullYear();
    let copyrightRange = year === 2020 ? "2020" : "2020 - " + year;
</script>

<style>
    #title {
        padding-left: 20px;
    }

    #copyright {
        padding-right: 20px;
    }

    footer {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        background-color: rgb(236, 236, 236);
    }
</style>

<footer>
    <p id="title">Honda C30A Bearing Calculator</p>
    <p>Made with <a href="https://svelte.dev">Svelte</a> and <a href="https://docs.svelteit.dev/">Svelteit</a></p>
    <p id="copyright">© {copyrightRange} - <a href="https://github.com/jstohler">Jon Stohler</a></p>
</footer>