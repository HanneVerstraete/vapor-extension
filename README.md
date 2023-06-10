# Vapor for Visual Studio Code

This is a proof of concept for an extension that adds support for Vapor. The development of this proof of concept was caried out as part of my bachelor thesis for HoGent. This extension already includes three new features. However, as it is only a proof of concept, there is still room for improvement and the possibility of expanding the range of features.

## Features 
The following three features were developed:
* Live leaf rendering
* Vapor tasks
* Vapor snippets

### Live leaf rendering
This feature allows you to have a live preview of your leaf templates. The preview will update in real-time as you work on your leaf files. To use this feature, you need to perform a small setup, which is described below. 

1. In the routes.swift file, you need to add an additional endpoint. An example of such an endpoint is provided below. You can either copy the code example or generate this endpoint using the 'leaf-preview' snippet.
2. In the render method of this endpoint, you must include all the dummy data that the templates require.
3. You can configure the baseUrl to match the one you are using by modifying the comment in the code example below.

Once you have completed the setup, you can execute the 'Render Leaf' command, which will open a second window displaying a preview of your leaf file.

```
app.get("leaf-preview", ":template") { req -> EventLoopFuture<View> in
    // localhost = {addOwnUrl}
    let template = req.parameters.get("template")!
    return req.view.render(template, {addDummyData})
}
```

### Vapor snippets
Several snippets for Vapor code patterns have been added, including a snippet to generate the additional endpoint required for the 'Live leaf rendering' feature.

### Vapor tasks
This proof of concept contains 3 tasks:
1. Serve the app (executes: swift run App serve)
2. Print all routes (executes: swift run App routes)
3. Start migration (executes: swift run App migrate)


