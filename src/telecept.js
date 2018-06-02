#!/usr/bin/env node
const fs = require('fs')
const chalk = require('chalk')
const Core = require("./lib/core.js")
const CoreWriter = require('./lib/writer.js')

class Telecept
{
	constructor(argc, argv) {
		if (argc < 3) {
			this.help()
			process.exit(1)
		}

		this.inputUri = argv[2]
		if (! this.verifyFile())
			this.fatal("The input file " + this.inputUri + " either doesn't exist or cannot be read.")

		this.inputBuffer = this.readFile()
		this.core = new Core(this.inputBuffer)
	}

	help() {
		console.log("Usage: ./telecept input_file [options]")
	}

	fatal(error) {
		console.log(chalk.red(error));
		process.exit(1);
	}

	verifyFile() {
		return fs.existsSync(this.inputUri)
	}

	readFile() {
		console.log('Reading ' + this.inputUri)
		return fs.readFileSync(this.inputUri, {
			encoding: "utf8"
		})
	}

	compile() {
		let assembly = this.core.compile()
		let writer = new CoreWriter(assembly)
		writer.write()
		console.log(chalk.green("Compilation complete"))
	}
}

if (! module.parent)
	var inst = new Telecept(process.argv.length, process.argv).compile()
