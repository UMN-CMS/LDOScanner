import purgecss from '@fullhuman/postcss-purgecss';

const config = {
  plugins: [
    purgecss({
        content: ['./**/*.html', './**/*.svelte']
    })
  ]
}

export default config;
