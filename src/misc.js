class Misc {
  provenance(dv, parentPropName) {
    let page = dv.current()
    let provenance = [page.file.name]

    while (page != undefined && page[parentPropName] != undefined) {
      provenance.push(page[parentPropName])
      page = dv.page(page[parentPropName])
    }

    return provenance.reverse().join(' ⪼︎︎ ')
  }
}