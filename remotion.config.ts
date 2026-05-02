import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules
          ? currentConfiguration.module.rules
          : []
        ).filter((rule) => {
          if (rule === "..." || !rule || typeof rule !== 'object') {
            return false;
          }
          const ruleObj = rule as { test?: unknown };
          if (ruleObj.test?.toString().includes(".css")) {
            return false;
          }
          return true;
        }),
        {
          test: /\.css$/i,
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    "postcss-preset-env",
                    "tailwindcss",
                    "autoprefixer",
                  ],
                },
              },
            },
          ],
        },
      ],
    },
  };
});