describe('Logs', function() {
  let logs
  let fakePage
  let fakePages
  let fakeDv

  beforeEach(function() {
    logs = new Logs()

    fakePage = {
      date: '1/1/1',
      time: '12:00',
      synopsis: 'a synopsis',
      file: { path: 'a/path' }
    }

    fakePages = {
      where: function() { return fakePages },
      sort: function() { return fakePages },
      [Symbol.iterator]() {
        let index = 0
        return {
          next: function() {
            index++

            if (index < 2)
              return { value: fakePage, done: false }
            else
              return { done: true }
          }
        }
      }
    }

    fakeDv = {
      pages: function() { return fakePages },
      paragraph: function() { return 'a paragraph' },
      fileLink: function() { return 'a link' }
    }
  })

  it('should filter logs', function() {
    // spyOn(logs, '_linked').and.returnValue([1])
    expect(logs._linked(fakeDv)).toBe(fakePages)
    expect(logs._linked(fakeDv, 'synopsis')).toBe(fakePages)
  })

  it('should list synopsis', function() {
    spyOn(fakeDv, 'paragraph') //.and.callThrough()
    logs.synopsisIgnoreContext(fakeDv)

    expect(fakeDv.paragraph).toHaveBeenCalled()
  })
})