# Bullet Journal
This is the source code for [my bullet journaling React web app](https://caalden.github.io/bullet-journal/). Bullet journaling is an organizational management
technique, traditionally done by hand and on paper. Much of this takes its inspiration from the methods discussed on 
[bulletjournal.com](https://bulletjournal.com/).

## Implementation

This app is written in Typescript using React. An effort has been made to implement core functionality with functional programming where possible. Data
validation is primarily handled using [io-ts](https://github.com/gcanti/io-ts) and much of the internal logic relies on helpers from
[fp-ts](https://github.com/gcanti/fp-ts) (a companion library to `io-ts` which defines many useful functional programming tools).

The app is managaged completely locally, meaning all of your tasks are only known about by your browsers local storage. While it is possible for your data
to be lost this way, it means that the site has no database overhead and fewer privacy concerns.
