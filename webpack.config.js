const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const TerserWebpackPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const optimization = () => {
    const config = {
        // splitChunks: {
        //     chunks: 'all'
        // }
    }

    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }

    return config
}

const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                // hmr: isDev,
                // reloadAll: true
            },
        },
        'css-loader'
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}


const plugins = () => {
    const base = [
        new HtmlWebpackPlugin({
            template: __dirname + "/src/index.html",
            minify: {
                collapseWhitespace: isProd
            },
            inject: 'body'
        }),
        new webpack.DefinePlugin({  // plugin to define global constants
            API_KEY: JSON.stringify(process.env.API_KEY)
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": "jquery"
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/assets'),
                    to: path.resolve(__dirname, 'dist/assets')
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: filename('css')
        })
    ]

    if (isProd) {
        base.push(new BundleAnalyzerPlugin())
    }

    return base
}


module.exports = {
    entry: __dirname + "/src/index.js", // webpack entry point. Module to start building dependency graph
    output: {
        path: __dirname + '/dist', // Folder to store generated bundle
        filename: 'bundle.[hash].js',  // Name of generated bundle after build
        // publicPath: '/' // public URL of the output directory when referenced in a browser
    },
    optimization: optimization(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl-loader'
            },
            {
                test: /\.(glb|gltf|png|jpg|svg|gif|ttf|woff|woff2|eot)$/,
                loader: 'file-loader',
                options: {
                    outputPath: 'assets',
                },
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'cache-loader',
                    },
                    'babel-loader'
                ],
                exclude: [
                    /node_modules/
                ]
            },
        ]
    },
    devServer: {  // configuration for webpack-dev-server
        contentBase: './src',  //source of static assets
        port: 7700, // port to run dev-server
        hot: isDev
    },
    devtool: isDev ? 'source-map' : false,
    plugins: plugins(),
}
