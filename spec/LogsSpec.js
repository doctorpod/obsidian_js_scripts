describe('Logs', function() {
  let logs

  beforeEach(() => {
    logs = new Logs()
  })

  describe('_groupRespectOrder', () => {
    const page1 = { synopsis: 'Apples', context: 'Fruit', file: {path: 'a/path'} }
    const page2 = { synopsis: 'Pears',  context: 'Fruit', file: {path: 'a/path'} }
    const page3 = { synopsis: 'Bears',                    file: {path: 'a/path'} }
    const page4 = { synopsis: 'Snowshoes',                file: {path: 'a/path'} }
    const page5 = { synopsis: 'Hammer', context: 'Tools', file: {path: 'a/path'} }

    const pages = [page1, page2, page3, page4, page5]

    it('returns array of correct groups', () => {
      const expected = [
        { key: 'Fruit', rows: [page1, page2] },
        { key: null,    rows: [page3] },
        { key: null,    rows: [page4] },
        { key: 'Tools', rows: [page5] },
      ]

      expect(logs._groupRespectOrder(pages, 'context')).toEqual(expected)
    })
  })

  describe('_withLink', () => {
    it('returns text with link', () => {
      expect(logs._withLink('foo', fakeDv, fakePage)).toEqual('foo >>>')
    })
  })

  describe('_withLinkAndTime', () => {
    it('returns text with link and time', () => {
      expect(logs._withLinkAndTime('foo', fakeDv, fakePage)).toEqual('12:00: foo >>>')
    })
  })

  describe('synopsisWithTime', () => {
    it('should filter logs', () => {
      // spyOn(logs, '_linked').and.returnValue([1])
      expect(logs._linked(fakeDv)).toBe(fakePages)
      expect(logs._linked(fakeDv, 'synopsis')).toBe(fakePages)
    })

    it('should list synopsis', () => {
      spyOn(fakeDv, 'paragraph') //.and.callThrough()
      logs.synopsisWithTime(fakeDv)

      expect(fakeDv.paragraph).toHaveBeenCalled()
    })
  })
})