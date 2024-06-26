class Logs {
  // Headline grouped under context
  // Replaces summary() from 2024-04-09
  headlines(dv) {
    const groups = this._linked(dv, 'headline')
      .groupBy(p => p.Context)

    if (groups.length == 0) {
      dv.paragraph('No headlines')
    } else {
      for (let group of groups) {
        dv.header(3, group.key)
        dv.list(group.rows.sort(k => k.time, 'asc').map(k => this._withLink(k.headline, dv, k)))
      }
    }
  }

  // Synopsis grouped under context where type is summary
  // Superceded by headlines() from 2024-04-09
  // Kept for backward compatibility so headlineless logs will appear
  summary(dv) {
    const linkedSummaries = dv.pages('[[]] AND #type/summary AND !"templates"')

    for (let group of linkedSummaries.groupBy(p => p.Context)) {
      dv.header(3, group.key)
      dv.list(group.rows.sort(k => k.time, 'asc').map(k => this._withLink(k.synopsis, dv, k)))
    }
  }

  // HISTORY =========================================
  // List of logs with time grouped by date
  // Used in work Log section
  historyAllWithTime(dv) {
    const grouped = this._linked(dv).groupBy(p => p.date)

    if (grouped.length == 0) {
      dv.paragraph('No logs')
    } else {
      for (let group of grouped) {
        if (group.key.path != dv.current().file.path) {
          dv.header(3, dv.date(group.key).toFormat('yyyy-MM-dd, ccc'));
        }

        dv.list(group.rows.sort(k => k.time, 'asc').map(k => this._withLinkAndTime(k.synopsis, dv,k)))
      }
    }
  }

  // Like historyAllWithTime but preceed with context (if present) instead of time
  // Used in personal as history in non-log files
  historyAllWithContext(dv) {
    const thisClass = this

    // Use dv.date in case date is a link
    const groups = this._linked(dv, 'synopsis').groupBy(p => dv.date(p.date))

    if (groups.length == 0) {
      dv.paragraph('No logs')
    } else {
      for (let group of groups) {
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
  }

  // List of logs with time
  // Used in work by dailies
  historyDayWithTime(dv) {
    const logs = this._linked(dv, 'synopsis')
      .map(page => this._withLinkAndTime(page.synopsis, dv, page))

    if (logs.length == 0) {
      dv.paragraph('No log')
    } else {
      dv.list(logs)
    }
  }

  // Paragraphs of logs grouped by context if present
  // Used in personal by dailies
  historyDayByContext(dv) {
    let para
    const groups = this._groupRespectOrder(
      this._linked(dv, 'synopsis'),
      'context'
    )

    for (let group of groups) {
      para = group.rows
        .map(p => this._withLink(p.synopsis, dv, p))
        .join(' ')

      dv.paragraph(
        group.key ? group.key + ': ' + para : para
      )
    }
  }


  collectOutlinks(dv) {
    const links = this._linked(dv)
                      .flatMap(p => p.file.outlinks)
                      .distinct()
                      .where(l => l.path != dv.current().file.path)
                      // Ignore journal links coz this view often used with history
                      // which already has them as group headings
                      .where(l => !l.path.match(/journal/))
                      // Ignore links already hard outlinked in this file
                      .where(l => !dv.current().file.outlinks.map(l => l.path).includes(l.path))
                      .sort(l => l.display)

    if (links.length == 0) {
      dv.paragraph('No mentions in log')
    } else {
      dv.list(links)
    }
  }

  inboundMentions(dv) {
    const inLinks = dv.pages('[[]] AND !"journal" AND !"templates"')
      .where(p => !p.date && !p.time)
      .sort(p => p.file.name)
      .map(p => p.file.link)

    if (inLinks.length == 0) {
      dv.paragraph('No inbound mentions')
    } else {
      dv.list(inLinks)
    }
  }

  // Used in annuals
  headlineByMonth(dv) {
    for (let month of this._linked(dv, 'headline').groupBy(p => p.date.toFormat('MM-MMMM'))) {
      dv.header(2, month.key.slice(3))

      dv.list(
        month.rows.sort(k => [k.date, k.time]).map(k => this._withLink(k.headline, dv, k))
      )
    }
  }

  // Used in summaries
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

  // Used in gratitude.md
  // propName must be an array
  gather(dv, propName) {
    const hits = this._linked(dv, propName)

    const vals = hits.flatMap(
      page => page[propName].map(prop => this._withLink(prop, dv, page))
    ).sort()

    dv.list(vals)
  }

  // Use to get images in dailies
  // Similar to gather?
  getAll(dv, propName) {
    const hits = this._linked(dv, propName)
    return hits.flatMap(page => page[propName])
  }

  // Used in cultivations
  // Notes must have branch and optionally parent-branch properties
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
      parentBranch = this._mustString(n['parent-branch'])

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

  // Helpers ==================================

  // Returns an array of group objects:
  // [ { key: 'A key', rows: [page1,...] },... ]
  _groupRespectOrder(pages, groupProp) {
    let accum = {
      key: null,
      groups: []
    }

    const logs = this
    const callback = function(acc, current) {
      if (current[groupProp] == undefined) {
        acc.groups.push({key: null, rows: [current]})
      }
      else if (acc.key != current[groupProp]) {
        acc.groups.push({key: current[groupProp], rows: [current]})
      }
      else {
        acc.groups[acc.groups.length-1].rows.push(current)
      }

      acc.key = current[groupProp]
      return acc
    }

    return pages.values.reduce(callback, accum).groups
  }

  _linked(dv, propName) {
    const hits =  dv.pages('[[]] AND !"journal" AND !"templates"').where(p => p.date && p.time)

    if (propName == undefined) {
      return hits.sort(p => [p.date, p.time])
    } else {
      return hits.where(p => p[propName]).sort(p => [p.date, p.time])
    }
  }

  _withLink(text, dv, page) {
    return text + ' ' + dv.fileLink(page.file.path, false, '➦')
  }

  _withLinkAndTime(text, dv, page) {
    return page.time + ': ' + this._withLink(text, dv, page)
  }

  // Only works for possible links
  // Only used by graph() so far
  _mustString(linkOrString) {
    let path

    if (linkOrString == undefined) return undefined

    path = linkOrString.path || linkOrString
    return path.split('/').pop().replace('.md','')
  }
}