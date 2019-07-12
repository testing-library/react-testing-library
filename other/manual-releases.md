# manual-releases

This project has an automated release set up. So things are only released when
there are useful changes in the code that justify a release. But sometimes
things get messed up one way or another and we need to trigger the release
ourselves. When this happens, simply bump the number below and commit that with
the following commit message based on your needs:

**Major**

```
fix(release): manually release a major version

There was an issue with a major release, so this manual-releases.md
change is to release a new major version.

Reference: #<the number of a relevant pull request, issue, or commit>

BREAKING CHANGE: <mention any relevant breaking changes (this is what triggers the major version change so don't skip this!)>
```

**Minor**

```
feat(release): manually release a minor version

There was an issue with a minor release, so this manual-releases.md
change is to release a new minor version.

Reference: #<the number of a relevant pull request, issue, or commit>
```

**Patch**

```
fix(release): manually release a patch version

There was an issue with a patch release, so this manual-releases.md
change is to release a new patch version.

Reference: #<the number of a relevant pull request, issue, or commit>
```

The number of times we've had to do a manual release is: 3
