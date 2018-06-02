const fs = require('fs')
const chalk = require('chalk')

class CoreWriter
{
	constructor(assembly) {
		this.assembly = assembly
	}

	write() {
		console.log(chalk.yellow('Writing...'))

		for (let uri in this.assembly) {
			
			try {
				fs.writeFileSync(uri, this.assembly[uri], {
					encoding: "utf8"
				})
			} catch (e) {
				console.log(chalk.red("    Error writing " + uri + ": " + e))
				continue
			}

			try {
				let stat = fs.statSync(uri)
				console.log("    " + chalk.blue(uri) + " " + chalk.white("(" + stat.size +" bytes)"))
			} catch (e) {
				console.log("    " + chalk.blue(uri) + " " + chalk.white("(unknown bytes)"))
			}

		}

	}
}

module.exports = CoreWriter
