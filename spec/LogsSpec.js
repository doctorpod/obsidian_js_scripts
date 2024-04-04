describe('Logs', function() {
  let logs

  beforeEach(() => {
    logs = new Logs()
  })

  describe('_synopsisByContext', () => {
    let pages

    beforeEach(() => {
      pages = [
        { synopsis: 'Apples', context: 'Fruit', file: {path: 'a/path'} },
        { synopsis: 'Pears',  context: 'Fruit', file: {path: 'a/path'} },
        { synopsis: 'Bears',                    file: {path: 'a/path'} },
        { synopsis: 'Snowshoes',                file: {path: 'a/path'} },
        { synopsis: 'Hammer', context: 'Tools', file: {path: 'a/path'} },
      ]
    })

    it('groups by context', () => {
      const expected = [
        'Fruit: Apples >>> Pears >>>',
        'Bears >>>',
        'Snowshoes >>>',
        'Tools: Hammer >>>',
      ]

      expect(logs._synopsisByContext(fakeDv, pages)).toEqual(expected)
    })
  })

  describe('synopsisIgnoreContext', () => {
    it('should filter logs', () => {
      // spyOn(logs, '_linked').and.returnValue([1])
      expect(logs._linked(fakeDv)).toBe(fakePages)
      expect(logs._linked(fakeDv, 'synopsis')).toBe(fakePages)
    })

    it('should list synopsis', () => {
      spyOn(fakeDv, 'paragraph') //.and.callThrough()
      logs.synopsisIgnoreContext(fakeDv)

      expect(fakeDv.paragraph).toHaveBeenCalled()
    })
  })
})