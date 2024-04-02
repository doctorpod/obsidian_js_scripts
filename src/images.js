// Needs Image Layouts plugin installed
class Images {
  tile(dv, images) {
    const iCount = images.length
    var layout

    switch (images.length) {
      case 0:
        return
      case 1:
        dv.paragraph(this._toInline(images.first()))
        return
      case 2:
        layout = 'a'
        break
      case 3:
        layout = 'd'
        break
      case 4:
        layout = 'g'
        break
      case 5:
      case 6:
        layout = 'masonry-2'
        break
      default:
        layout = 'masonry-3'
    }

    dv.paragraph('```image-layout-' + layout + "\n" + images.map(i => this._toInline(i)).join("\n") + "\n```")
  }

  // Helpers
  _toInline(link) {
    return '![](' + link + ')'
  }
}