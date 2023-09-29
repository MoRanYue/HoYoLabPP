import { htmlTag } from "./utils"

export async function richText(text: string) {
  let str: string = ''

  let pos: number = -1
  let char: string | undefined = undefined
  let advanced: number = 0
  let parsed: boolean = true
  function advance() {
    pos++
    advanced++
    char = text[pos]
  }

  advance()
  while (char) {
    if (char == '<') {
      advance()

      let key: string = ''
      let value: string = ''
      let inner: string = ''
      while (char && !['>', '='].includes(char)) {
        key += char
        advance()
      }
      key = key.trim().toLowerCase()

      if (char == '=') {
        advance()
        while (char && char != '>') {
          value += char
          advance()
        }
        value = value.trim()
      }

      if (char == '>') {
        advance()

        while (char && char != '<') {
          inner += char
          advance()
        }
        inner = await richText(inner)

        if (char == '<') {
          advance()
          if (char == '/') {
            let tempKey: string = ''

            advance()
            while (char && char != '>') {
              tempKey += char
              advance()
            }
            tempKey = tempKey.trim().toLowerCase()

            if (tempKey == key) {
              if (key == 'color') {
                str += htmlTag('span', {
                  style: `color: ${value};`
                }, inner)
              }
              else {
                // str += inner
                parsed = false
              }
            }
            else {
              parsed = false
            }
          }
          else {
            parsed = false
          }
        }
        else {
          parsed = false
        }
      }
      else {
        parsed = false
      }
    }
    else if (char == '\\') {
      advance()
      if (char == 'n') {
        str += htmlTag('br', undefined, undefined, true)
      }
    }
    else {
      str += char
    }

    if (parsed) {
      // str += char
    }
    else {
      pos -= advanced
      char = text[pos]
      str += char
    }
    advance()
    advanced = 0
  }

  return str
}