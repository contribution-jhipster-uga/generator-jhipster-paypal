const chalk = require('chalk');
const _ = require('lodash');
const shelljs = require('shelljs');
const fs = require('fs');
const jhipsterUtils = require('generator-jhipster/generators/utils');
const packagejs = require('../../package.json');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            init(args) {
                if (args === 'default') {
                    // do something when argument is 'default'
                }
            },
            readConfig() {
                this.jhipsterAppConfig = this.getJhipsterAppConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Can\'t read .yo-rc.json');
                }
            },
            displayLogo() {
                // it's here to show that you can use functions from generator-jhipster
                // this function is in: generator-jhipster/generators/generator-base.js
                this.printJHipsterLogo();

                // Have Yeoman greet the user.
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster paypal')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
            },
            checkJhipster() {
                const currentJhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (!semver.satisfies(currentJhipsterVersion, minimumJhipsterVersion)) {
                    this.warning(`\nYour generated project used an old JHipster version (${currentJhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`);
                }
            }
        };
    }

    prompting() {
        const prompts = [{
            type: 'input',
            name: 'message',
            message: 'Please put your paypal sandbox client ID (if you do not have one, press enter)',
            default: 'sb'
        }];

        const done = this.async();
        this.prompt(prompts).then((props) => {
            this.props = props;
            // To access props later use this.props.someOption;

            done();
        });
    }

    writing() {
        // function to use directly template
        this.template = function(source, destination) {
            this.fs.copyTpl(
                this.templatePath(source),
                this.destinationPath(destination),
                this
            );
        };

        // read config from .yo-rc.json
        this.baseName = this.jhipsterAppConfig.baseName;
        this.packageName = this.jhipsterAppConfig.packageName;
        this.packageFolder = this.jhipsterAppConfig.packageFolder;
        this.clientFramework = this.jhipsterAppConfig.clientFramework;
        this.clientPackageManager = this.jhipsterAppConfig.clientPackageManager;
        this.buildTool = this.jhipsterAppConfig.buildTool;

        // use function in generator-base.js from generator-jhipster
        this.angularAppName = this.getAngularAppName();

        // use constants from generator-constants.js
        const javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
        const resourceDir = jhipsterConstants.SERVER_MAIN_RES_DIR;
        const webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;

        // variable from questions
        this.message = this.props.message;

        // show all variables
        this.log('\n--- some config read from config ---');
        this.log(`baseName=${this.baseName}`);
        this.log(`packageName=${this.packageName}`);
        this.log(`clientFramework=${this.clientFramework}`);
        this.log(`clientPackageManager=${this.clientPackageManager}`);
        this.log(`buildTool=${this.buildTool}`);

        this.log('\n--- some function ---');
        this.log(`angularAppName=${this.angularAppName}`);

        this.log('\n--- some const ---');
        this.log(`javaDir=${javaDir}`);
        this.log(`resourceDir=${resourceDir}`);
        this.log(`webappDir=${webappDir}`);

        this.log('\n--- variables from questions ---');
        this.log(`\nmessage=${this.message}`);
        this.log('------\n');

        if (this.clientFramework === 'angular1') {
            this.template('dummy.txt', 'dummy-angular1.txt');
        }
        if (this.clientFramework === 'angularX' || this.clientFramework === 'angular2') {
            this.template('paypalcompletedpayments.jh', 'paypalcompletedpayments.jh');
            //this.template('dummy.txt', 'dummy-angularX.txt');
            this.template('paypal-payments.component.html', `${webappDir}app/paypal-payments/paypal-payments.component.html`);
            this.template('paypal-payments.module.ts', `${webappDir}app/paypal-payments/paypal-payments.module.ts`);
            this.template('paypal-payments.route.ts', `${webappDir}app/paypal-payments/paypal-payments.route.ts`);
            this.template('index.ts', `${webappDir}app/paypal-payments/index.ts`);

            // STYLE
            if (this.jhipsterAppConfig.useSass) {
                this.template(
                    `paypal-payments.component.scss`,
                    `${webappDir}app/paypal-payments/paypal-payments.component.scss`
                );
                this.template('paypal-payments.component.ts', `${webappDir}app/paypal-payments/paypal-payments.component.ts`);
            } else {
                this.template(
                    `paypal-payments.component.scss`,
                    `${webappDir}app/paypal-payments/paypal-payments.component.css`
                );
                this.template('paypal-payments0.component.ts', `${webappDir}app/paypal-payments/paypal-payments.component.ts`);
            }

            // APP MODULE
            this.addAngularModule(
                _.upperFirst(this.getAngularAppName()),
                'PaypalPayments',
                'paypal-payments',
                'paypal-payments',
                this.jhipsterAppConfig.enableTranslation,
                'angularX'
            );

            const navbarPath = `${jhipsterConstants.CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`;
            let navbarCode;
            navbarCode = `
            <li *ngSwitchCase="true" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <a class="nav-link" routerLink="paypal-payments" (click)="collapseNavbar()">
                    <i class="fa fa-hand-spock-o" aria-hidden="true"></i>
                    <span>Paypal payments</span>
                </a>
            </li>`;


            jhipsterUtils.rewriteFile({
                file: navbarPath,
                needle: 'jhipster-needle-add-element-to-menu',
                splicable: [navbarCode]
            }, this);




        }
        if (this.buildTool === 'maven') {
            this.template('dummy.txt', 'dummy-maven.txt');
        }
        if (this.buildTool === 'gradle') {
            this.template('dummy.txt', 'dummy-gradle.txt');
        }
    }

    install() {

        var content = fs.readFileSync(`${jhipsterConstants.CLIENT_MAIN_SRC_DIR}app/paypal-payments/paypal-payments.module.ts`);
        var regex = /REPLACEHERE/gi;
        var replacedContent = content.toString().replace(regex, this.angularAppName.charAt(0).toUpperCase() + this.angularAppName.substr(1));
        fs.writeFileSync(`${jhipsterConstants.CLIENT_MAIN_SRC_DIR}app/paypal-payments/paypal-payments.module.ts`, replacedContent);

        var replaceWithClientId = fs.readFileSync(`${jhipsterConstants.CLIENT_MAIN_SRC_DIR}app/paypal-payments/paypal-payments.component.ts`);
        var replacedWithClientId = replaceWithClientId.toString().replace('REPLACE_WITH_PAYPAL_CLIENT_ID', this.props.message);
        fs.writeFileSync(`${jhipsterConstants.CLIENT_MAIN_SRC_DIR}app/paypal-payments/paypal-payments.component.ts`, replacedWithClientId);

        if (shelljs.exec('jhipster import-jdl paypalcompletedpayments.jh').code !== 0) {
            shelljs.echo('Error: entity import fail');
            shelljs.exit(1);
        }
        let logMsg =
            `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

        if (this.clientFramework === 'angular1') {
            logMsg =
                `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install & bower install`)}`;
        }
        const injectDependenciesAndConstants = (err) => {
            if (err) {
                this.warning('Install of dependencies failed!');
                this.log(logMsg);
            } else if (this.clientFramework === 'angular1') {
                this.spawnCommand('gulp', ['install']);
            }
        };
        const installConfig = {
            bower: this.clientFramework === 'angular1',
            npm: this.clientPackageManager !== 'yarn',
            yarn: this.clientPackageManager === 'yarn',
            callback: injectDependenciesAndConstants
        };
        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            this.installDependencies(installConfig);
        }
    }

    end() {
        this.log('End of paypal generator');
    }
};
