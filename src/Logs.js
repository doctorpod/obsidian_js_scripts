class Logs {
  synopsisIgnoreContext(dv) {
    for (let page of this._linked(dv, 'synopsis')) {
      dv.paragraph(this._withLink(page.synopsis, dv, page))
    }
  }

  synopsis(dv) {
    let lastContext = ''
    let contextPara = []

    for (let page of this._linked(dv, 'synopsis')) {
      if (page.context) {
        if (page.context != lastContext) {
          if (contextPara.length > 0) {
            dv.paragraph(contextPara.join(' '))
          }

          contextPara = [page.context + ':']
        }

        contextPara.push(this._withLink(page.synopsis, dv, page))
      } else {
        if (contextPara.length > 0) {
          dv.paragraph(contextPara.join(' '))
          contextPara = []
        }

        dv.paragraph(this._withLink(page.synopsis, dv, page))
      }

      lastContext = page.context
    }

    if (contextPara.length > 0)
      dv.paragraph(contextPara.join(' '))
  }

  synopsisByDate(dv) {
    const thisClass = this

    for (let group of this._linked(dv, 'synopsis').groupBy(p => p.date)) {
      dv.header(3, group.key.toFormat('yyyy-MM-dd, ccc'))

      dv.list(
        group.rows.sort(k => k.time, 'asc').map(
          function(k) {
            let para

            if (k.context) {
              para = k.context + ': ' + k.synopsis
            } else {
              para = k.synopsis
            }

            return thisClass._withLink(para, dv, k)
          }
        )
      )
    }
  }

  headlineByMonth(dv) {
    for (let month of this._linked(dv, 'headline').groupBy(p => p.date.toFormat('MM-MMMM'))) {
      dv.header(2, month.key.slice(3))

      dv.list(
        month.rows.sort(k => [k.date, k.time]).map(k => this._withLink(k.headline, dv, k))
      )
    }
  }

  headlineByYear(dv) {
    for (let year of this._linked(dv, 'headline').groupBy(p => p.date.toFormat('yyyy'))) {
      dv.header(3, year.key)

      dv.list(
        year.rows.groupBy(p => p.date.toFormat('MM-MMM')).map(
          month => month.key.slice(3)
            + ': '
            + month.rows.sort(k => [k.date, k.time]).map(k => this._withLink(k.headline, dv, k)).join(' ')
        )
      )
    }
  }

  // Used to populate changeable properties. A poor man's event sourcing
  latestState(dv, props) {
    dv.list(
      props.map(prop => prop + ': ' + this.lastValue(dv, prop))
    )
  }

  lastValue(dv, propName) {
    const hit = this._linked(dv, propName).last()

    if (hit == undefined) {
      return '(Not set yet)'
    } else {
      return this._withLink(hit[propName], dv, hit)
    }
  }

  // propName must be an array
  gather(dv, propName) {
    const hits = this._linked(dv, propName)

    const vals = hits.flatMap(
      page => page[propName].map(prop => this._withLink(prop, dv, page))
    ).sort()

    dv.list(vals)
  }

  getAll(dv, propName) {
    const hits = this._linked(dv, propName)
    return hits.flatMap(page => page[propName])
  }

  // Notes must have branch and optionally parent_branch properties
  graph(dv, debug = false) {
    const nodes = this._linked(dv, 'branch')

    if (nodes.length == 0) return

    let prevBranch = this._mustString(nodes[0].branch)

    const header = `%%{init: {'gitGraph': {'mainBranchName': '${prevBranch}'}}}%%\ngitGraph\n`

    const commands = []
    let label
    let currBranch
    let parentBranch

    for (let n of nodes) {
      label = n.date.toFormat('MMM yyyy') + ' - ' + n.headline
      currBranch = this._mustString(n.branch)
      parentBranch = this._mustString(n.parent_branch)

      if (parentBranch) {
        if (prevBranch != parentBranch) commands.push(['checkout "' + parentBranch + '"', n])
        commands.push(['branch "' + currBranch + '"', n])
      } else {
        if (prevBranch != currBranch) commands.push(['checkout "' + currBranch + '"', n])
      }

      commands.push(['commit id: "' + label + '"', n])
      prevBranch = currBranch
    }

    if (debug) {
      const debugBlock = `${header.replaceAll('%%', '--')} ${commands.map(c => `${c[0]} ${c[1].file.link}`).join("\n")}`
      dv.paragraph(debugBlock)
    }

    const mermaidBlock = '```mermaid' + `\n${header} ${commands.map(c => c[0]).join("\n")}` + "\n```\n"
    dv.paragraph(mermaidBlock)
  }

  // Helpers
  _linked(dv, propName) {
    const hits =  dv.pages('[[]] AND !"journal" AND !"templates"')
      .where(p => p.date && p.time)

    if (propName == undefined) {
      return hits.sort(p => [p.date, p.time])
    } else {
      return hits.where(p => p[propName]).sort(p => [p.date, p.time])
    }
  }

  _withLink(text, dv, page) {
    return text + ' ' + dv.fileLink(page.file.path, false, '➦')
  }

  _titleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Only works for possible links
  _mustString(linkOrString) {
    let path

    if (linkOrString == undefined) return undefined

    path = linkOrString.path || linkOrString
    return path.split('/').pop().replace('.md','')
  }
}