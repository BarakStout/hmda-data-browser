import fileSaver from 'file-saver'

function makeUrl(obj, isCSV) {
  let url = '/v2/data-browser-api/view'
  if (obj.state){
    if(obj.state === 'nationwide') url += '/nationwide'
    else url += '/state/' + obj.state
  }
  if (obj.msaMd) url += '/msamd/' + obj.msaMd

  if(isCSV) url += '/csv'

  url += '?'

  const vars = obj.variables
  if(vars) {
    const keys = Object.keys(vars)
    let isFirstParam = true
    keys.forEach(key => {
      const varKeys = Object.keys(vars[key])
      if(varKeys.length){
        if(isFirstParam) isFirstParam = false
        else url += '&'
        url += key + '='
        varKeys.forEach((k, i) => {
          if(i) url += ','
          url += k
        })
      }
    })
  }

  return url
}

function runFetch(url, isCSV) {

  let headers = { Accept: 'application/json' }

  if (isCSV) {
    headers = {
      'Content-Type': 'text/csv',
      Accept: 'text/csv'
    }
  }

  var fetchOptions = {
    method: 'GET',
    headers: headers
  }

  return fetch(url, fetchOptions)
    .then(response => {
      if(response.status > 399) throw response
      return new Promise(resolve => {
        if (isCSV) {
          return resolve(response.text())
        }
        resolve(response.json())
      })
    })
}

function makeCSVName(obj) {
  let name = ''
  if(obj.state) name += obj.state + '-'
  if(obj.msaMd) name += obj.msaMd + '-'

  if(obj.variables){
    Object.keys(obj.variables).forEach(key => {
      name += key + '-'
    })
  }

  name = name.slice(0, -1)

  name += '.csv'

  return name
}

export function getSubsetDetails(obj){
  return runFetch(makeUrl(obj))
}

export function getCSV(obj){
  return runFetch(makeUrl(obj, true), true).then(csv => {
          return fileSaver.saveAs(
            new Blob([csv], { type: 'text/csv;charset=utf-16' }),
            makeCSVName(obj)
    )
  })
}
