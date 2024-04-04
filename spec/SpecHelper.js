let fakePage
let fakePages
let fakeDv

beforeEach(function () {
  fakePage = {
    date: '1/1/1',
    time: '12:00',
    synopsis: 'a synopsis',
    file: {
      path: 'a/path'
    }
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
    fileLink: function() { return '>>>' }
  }

  jasmine.addMatchers({
    toBePlaying: function () {
      return {
        compare: function (actual, expected) {
          const player = actual;

          return {
            pass: player.currentlyPlayingSong === expected && player.isPlaying
          };
        }
      };
    }
  });
});
