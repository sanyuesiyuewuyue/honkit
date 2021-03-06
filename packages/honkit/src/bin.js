const assert = require("assert");
const { Command } = require("commander");
const pkg = require("../package.json");
const Honkit = require("./index");
module.exports.run = (argv = process.argv) => {
    const program = new Command();
    return new Promise((resolve, reject) => {
        program.version(pkg.version);
        Honkit.commands.forEach((spec) => {
            let subcommand = program.command(spec.name).description(spec.description);
            const options = spec.options || [];
            options.forEach((spec) => {
                if (spec.values) {
                    const template = `--${spec.name} <${spec.name}>`;
                    const description = `${spec.description} (${spec.values.map(JSON.stringify).join(", ")})`;
                    subcommand = subcommand.option(
                        template,
                        description,
                        (value, _dummyPrevious) => {
                            assert(spec.values.includes(value), `Invalid value ${value} for ${spec.name}`);
                            return value;
                        },
                        spec.defaults
                    );
                } else {
                    subcommand = subcommand.option(
                        spec.defaults ? `--${spec.name} <type>` : `--${spec.name}`,
                        spec.description,
                        spec.defaults
                    );
                }
            });

            subcommand = subcommand.action((...joinedArgs) => {
                const args = joinedArgs.slice(0, -1);
                const kwargs = joinedArgs.slice(-1)[0];
                spec.exec(args, kwargs)
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        });
        program.parse(argv);
    });
};
