https://dfa1234.github.io/notes-reader

An experiment: is it possible to work out the note being played on a piano with the Web Audio API?

The result. No, it's not really possible.
It gets the note right 80% of the time if it's loud, but often jumps about as the note trails off.

It gets three of the four samples when played directly into the `audioContext` but only the two middles ones
when played out the through the speakers, in through a mic and captured with `navigator.getUserMedia`
