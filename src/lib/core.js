const chalk = require('chalk')

const ATFCSS_START_SEQ = "/*@telecept"
const ATFCSS_END_SEQ = "/*@end-telecept"
const ATFCSS_STATE_DEFAULT = 0x0
const ATFCSS_STATE_ACTIVE = 0x1

class Core 
{
	constructor(input, config) {
		this.input = input
		this.config = config
	}

	compile() {
		let tokens = this.tokenize()
		let assembly = this.assemble(tokens)
		return assembly	
	}

	tokenize() {
		let tokens = []
		let state = ATFCSS_STATE_DEFAULT;
		let start_detect_buffer = ""
		let end_detect_buffer = ""
		let currentLine = 1;
		let nameBuffer = "";

		console.log(chalk.green('Tokenizing...'))
		for (let i=0; i<this.input.length; ++i) {
			if (this.input[i] == "\n")
				currentLine++

			switch (state) {
				case ATFCSS_STATE_DEFAULT:
					start_detect_buffer += this.input[i]
					if (start_detect_buffer.length > ATFCSS_START_SEQ.length)
						start_detect_buffer = start_detect_buffer.substr(1)

					//Detect /*@atf
					if (start_detect_buffer == ATFCSS_START_SEQ) {
						tokens.splice(tokens.length - ATFCSS_START_SEQ.length, tokens.length -1)
						//Read until */
						i++;
						while (i < this.input.length) {
							nameBuffer += this.input[i];
							if (nameBuffer.substr(nameBuffer.length -2, 2) == "*/") {
								nameBuffer = nameBuffer.substr(0, nameBuffer.length -2).trim()
								tokens.push({
									type: "OPEN_ATF",
									value: nameBuffer
								})
								state = ATFCSS_STATE_ACTIVE
								end_detect_buffer = ""
								++i
								break
							}
							++i
						}
					}

					break
				case ATFCSS_STATE_ACTIVE:
					end_detect_buffer += this.input[i]
					if (end_detect_buffer.length > ATFCSS_END_SEQ.length)
						end_detect_buffer = end_detect_buffer.substr(1)

					//Detect /*@end-atf
					if (end_detect_buffer == ATFCSS_END_SEQ) {
						
						tokens.splice(tokens.length - ATFCSS_END_SEQ.length, tokens.length -1)
						//Read until */
						let endBuffer = "";
						i++;
						while (i < this.input.length) {
							endBuffer += this.input[i];
							if (endBuffer.substr(endBuffer.length -2, 2) == "*/") {
								tokens.push({
									type: "CLOSE_ATF",
									value: nameBuffer
								})
								state = ATFCSS_STATE_DEFAULT
								start_detect_buffer = ""
								nameBuffer = ""
								++i
								break
							}
							++i
						}

					}

					break

			}

			tokens.push({
				type: "LITERAL",
				value: this.input[i]
			})
		}

		return tokens

	}

	assemble(tokens) {

		let assembly = {}
		let active = false
		let currentBuffer = ""

		console.log(chalk.green('Assembling...'))
		for (var i=0; i<tokens.length; ++i) {
			let token = tokens[i]

			switch (active) {
				case false:
					if (token.type == "OPEN_ATF") {
						if (! assembly.hasOwnProperty(token.value)) {
							assembly[token.value] = ""
							console.log(chalk.blue("    " + token.value))
						}
						currentBuffer = token.value
						active = true
						break
					}
					break;
				case true:
					if (token.type == "CLOSE_ATF") {
						active = false
						currentBuffer = ""
					} else if (token.type == "LITERAL")
						assembly[currentBuffer] += token.value
					break
			}
		}

		return assembly

	}
}

module.exports = Core;
