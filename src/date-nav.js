class DateNav {
  nav(dv) {
    let links = dv.pages('"journal"')
                  .filter(p => p.file.name.match(/\d\d\d\d-\d\d-\d\d/))
                  .sort(p => p.file.name)
                  .map(p => p.file.link)

    let iThis = links.indexOf(dv.current().file.link)
    let offsets = [1, 5, 20, 250]

    let prevs = offsets.map(function(o) {
      let index = iThis - o
      let display = '⪻' + o
      let link = null

      if (index >= 0) {
        link = links.values.at(index)
        link.display = display
      }

      return link
    }).toReversed()

    let nexts = offsets.map(function(o) {
      let index = iThis + o
      let display = o + '︎⪼︎︎'
      let link = null

      if (index < links.length) {
        link = links.values.at(index)
        link.display = display
      }

      return link
    })

    dv.paragraph(prevs.join(' ') + ' | ' + nexts.join(' '))
  }

  nextGTD(dv) {
    const hit = dv.pages("[[]] AND #type/sweep").sort(p => p['made on']).last()

    if (hit == undefined)
      return 'No file yet'
    else
      return hit.file.link
  }
}