const { Compilation } = require('webpack');

module.exports = class Summary {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        const options = this.options;
        compiler.hooks.thisCompilation.tap('summary-plugins', (compilation) => {
            const {
                RawSource
            } = compiler.webpack.sources;
            compilation.hooks.processAssets.tapAsync(
                {
                    name: 'summary-plugins',
                    stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
                },
                (assets, callback) => {
                    const assetKeys = Object.keys(assets);
                    const assetsJson = JSON.stringify({
                        ...options,
                        assets: assetKeys,
                    }, null, "\t");
                    compilation.assets['assets.json'] = new RawSource(assetsJson);
                    callback();
                }
            );
        })
    }
}

