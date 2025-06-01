# registry-template

1. Add your component to the registry/default/{blocks | ui}/{component} folder.
2. Add your component to the registry.json (don't forget to include dependencies)
3. Start the server: `yarn dev` | `pnpm dev`
4. **Optional:** Install your component to an external project: `npx shadcn add http://localhost:3000/r/{component}.json`

## ShadCN Registry

You can use the `shadcn` CLI to run your own component registry. Running your own
component registry allows you to distribute your custom components, hooks, pages, and
other files to any React project.

> [!IMPORTANT]  
> This template uses Tailwind v4. For Tailwind v3, see [registry-template](https://github.com/shadcn-ui/registry-template).

## Getting Started

This is a template for creating a custom registry using Next.js.

- The template uses a `registry.json` file to define components and their files.
- The `shadcn build` command is used to build the registry.
- The registry items are served as static files under `public/r/[name].json`.
- The template also includes a route handler for serving registry items.
- Every registry item are compatible with the `shadcn` CLI.
- We have also added v0 integration using the `Open in v0` api.

## Documentation

Visit the [shadcn documentation](https://ui.shadcn.com/docs/registry) to view the full documentation.
