const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env)  => {
	const production = env && env.prod;

	const config = {
		entry: {
			index: __dirname + '/src/index.ts',
		},
		output: {
			filename: '[name].js',
			library: 'png-validator',
			libraryTarget: 'umd',
			path: __dirname + '/dist',
			globalObject: 'this'
		},
		mode: 'development',
		devtool: 'source-map',
		resolve: {
			extensions: [ '.ts', '.js' ],
			modules: [
				__dirname + '/src',
				__dirname + '/node_modules',
			],
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: [
						{
							loader: 'ts-loader',
							options: {
								configFile: __dirname + '/tsconfig.json'
							},
						},
					],
					exclude: /node_modules/,
				},
			]
		},
		plugins: [
			new CleanWebpackPlugin(),
		],
	}

	if (production) {
		config.mode = 'production';
		config.devtool = undefined;
	} else {
		
	}

	return config;
};
