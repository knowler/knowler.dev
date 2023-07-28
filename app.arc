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

#get /feed.xml

get /blog
get /blog/:slug

# Webmentions
get /webmention
#post /webmention

any /*
