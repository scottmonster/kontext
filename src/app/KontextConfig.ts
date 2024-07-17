import os from 'os'
import path from 'path';
import yaml from 'yaml';
import yargs from 'yargs';
import fs from 'fs';
import { screen } from 'electron'




export class KontextConfig {
  // [key: string]: string | string[] | boolean | number[];
  [key: string]: any;

  // dirLocation: string;
  // dirName: string;
  directory: string;
  path: string;
  contextPaths: string[];
  defaultWindowConfig: WindowConfig = {
    location: 'left',
    widthPercentage: 15,
    heightPercentage: 100,
    staticEditorPercentage: 50
  };

  monitors: { [id: string]: MonitorConfig } = {};

  constructor(args: Partial<KontextConfig>) {



    
    // at this point dir should be equal to an absolute path
    this.directory = args.directory || path.join(os.homedir(), 'kontext');
    
    
    if (!fs.existsSync(this.directory)) {
      console.log(`Attempting to create non-existent directory: ${this.directory}`);
      try {
        fs.mkdirSync(this.directory, { recursive: true });
      } catch (error) {
        console.log(`WHOA MAN!!!MAJOR ERROR While trying to create directory: ${this.directory} \n ${error}`);
        process.exit(1);
      }
    }
    
    
    this.path = path.join(this.directory, 'config.yaml');
  

    // this is where user options should really start
    this.contextPaths = [ path.join(this.directory, '/contexts') ];
    

    // this.monitors = [];

    let allDisplays = screen.getAllDisplays();
    for (let i = 0; i < allDisplays.length; i++) {
      let currentDisplay = allDisplays[i];
      const { id, bounds, workArea} = currentDisplay;
      const onlyThePropsWeCareAbout = { index: i, id, isDisabled: false, bounds, windowConfig: this.defaultWindowConfig}
      // this.monitors.push(onlyThePropsWeCareAbout);
      this.monitors[id] = onlyThePropsWeCareAbout;
    }
    

    const change: Partial<KontextConfig> = {}

    Object.keys(change).forEach((key) => {
      if (key in this) {
        this[key] = change[key];
      }
    })


    if (!fs.existsSync(this.path)) {
      this.writeConfig();
    } 

    if (args.resetConfig) {
      this.resetConfig();
    }

    this.parseConfig();

    for (let path of this.contextPaths) {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
    }

    // console.log(JSON.stringify(this, null, 2) );

    return 
  }

  private setOverridableProps(){

  }

  private setNonOverridableProps(){

  }

  private parseConfig(){
    
    let yamlConfig: Partial<KontextConfig> = yaml.parse(fs.readFileSync(this.path, 'utf-8'));
    
    // overwrite the default values with the values from the config file
    Object.keys(yamlConfig).forEach((key) => {
      if (key in this) {
        this[key] = yamlConfig[key];
      }
    })

  }

  public writeConfig(){
    const configToYaml = yaml.stringify(this);
    fs.writeFileSync(this.path, configToYaml);
  }

  // private deleteConfig(){
  //   fs.unlinkSync(this.path);
  // }

  private configExists(){
    return fs.existsSync(this.path)
  }

  private resetConfig(){
    console.log('resetting config...');
    let bakPath = path.join(this.directory, 'config.yaml.bak');
    if (fs.existsSync(bakPath)) {
      fs.unlinkSync(bakPath);
    }
    fs.renameSync(this.path, bakPath);
    this.writeConfig();
  }

}


export default KontextConfig;



// Step-by-Step Guide
// Install Required Packages

// You may want to use yargs for parsing command-line arguments and dotenv for loading environment variables from a .env file:

// bash
// Copy code
// npm install yargs dotenv
// Create Configuration File

// Create a configuration file in JSON format, for example config.json:

// json
// Copy code
// {
//   "host": "localhost",
//   "port": 8080,
//   "useSSL": false,
//   "database": {
//     "user": "admin",
//     "password": "password"
//   }
// }
// Create .env File for Environment Variables

// Create a .env file for environment-specific overrides:

// makefile
// Copy code
// HOST=127.0.0.1
// PORT=3000
// USE_SSL=true
// DB_USER=admin
// DB_PASSWORD=secret
// Create TypeScript File to Load and Merge Configurations

// Create a file config.ts to handle loading and merging configurations from the file, environment variables, and command-line arguments:

// typescript
// Copy code
// import * as fs from 'fs';
// import * as path from 'path';
// import * as yargs from 'yargs';
// import { config as dotenvConfig } from 'dotenv';

// // Load environment variables from .env file
// dotenvConfig();

// // Define the interface for your config
// interface Config {
//   host: string;
//   port: number;
//   useSSL: boolean;
//   database: {
//     user: string;
//     password: string;
//   };
// }

// // Load config from JSON file
// const configPath = path.resolve(__dirname, 'config.json');
// const fileConfig: Config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// // Load config from environment variables
// const envConfig: Partial<Config> = {
//   host: process.env.HOST,
//   port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
//   useSSL: process.env.USE_SSL === 'true',
//   database: {
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//   }
// };

// // Load config from command-line arguments
// const argv = yargs
//   .option('host', { type: 'string' })
//   .option('port', { type: 'number' })
//   .option('useSSL', { type: 'boolean' })
//   .option('dbUser', { type: 'string' })
//   .option('dbPassword', { type: 'string' })
//   .argv;

// const cliConfig: Partial<Config> = {
//   host: argv.host,
//   port: argv.port,
//   useSSL: argv.useSSL,
//   database: {
//     user: argv.dbUser,
//     password: argv.dbPassword,
//   }
// };

// // Merge configurations, with priority: CLI > ENV > FILE
// const finalConfig: Config = {
//   ...fileConfig,
//   ...envConfig,
//   ...cliConfig,
//   database: {
//     ...fileConfig.database,
//     ...envConfig.database,
//     ...cliConfig.database,
//   }
// };

// export default finalConfig;