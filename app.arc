@app
knowler

@begin
appID SXK9SZ5X

@static
prune true
fingerprint true

@http
get /
get /accessibility
get /about
get /privacy

#get /blog
#get /feed.xml

#get /blog/:slug
#get /blog/extending-html-form-validation
#get /blog/im-on-mastodon
#get /blog/managing-event-listeners-in-custom-elements
#get /blog/2020-in-music
#get /blog/open-in-codesandbox-bookmarklet
#get /blog/introduction-to-clover
#get /blog/gg-a-git-directory-jumping-helper
#get /blog/rust-for-a-rusty-game-developer
#get /blog/2018-in-music
#get /blog/hello-world

# Webmentions
get /webmention
#post /webmention

any /*
