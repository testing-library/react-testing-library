# Contributing

Thanks for being willing to contribute!

**Working on your first Pull Request?** You can learn how from this _free_
series [How to Contribute to an Open Source Project on GitHub][egghead]

## Project setup

1.  Fork and clone the repo
2.  Run `npm run setup -s` to install dependencies and run validation
3.  Create a branch for your PR with `git checkout -b pr/your-branch-name`

> Tip: Keep your `main` branch pointing at the original repository and make pull
> requests from branches on your fork. To do this, run:
>
> ```
> git remote add upstream https://github.com/testing-library/react-testing-library.git
> git fetch upstream
> git branch --set-upstream-to=upstream/main main
> ```
>
> This will add the original repository as a "remote" called "upstream," Then
> fetch the git information from that remote, then set your local `main` branch
> to use the upstream main branch whenever you run `git pull`. Then you can make
> all of your pull request branches based on this `main` branch. Whenever you
> want to update your version of `main`, do a regular `git pull`.

## Committing and Pushing changes

Please make sure to run the tests before you commit your changes. You can run
`npm run test:update` which will update any snapshots that need updating. Make
sure to include those changes (if they exist) in your commit.

### Update Typings

If your PR introduced some changes in the API, you are more than welcome to
modify the TypeScript type definition to reflect those changes. Just modify the
`/types/index.d.ts` file accordingly. If you have never seen TypeScript
definitions before, you can read more about it in its
[documentation pages](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html).
Though this library itself is not written in TypeScript we use
[dtslint](https://github.com/microsoft/dtslint) to lint our typings.

## Help needed

Please checkout the [the open issues][issues]

Also, please watch the repo and respond to questions/bug reports/feature
requests! Thanks!

[egghead]:
  https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github
[issues]: https://github.com/testing-library/react-testing-library/issues
