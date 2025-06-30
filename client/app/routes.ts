import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("posts/:slug", "routes/posts.$slug.tsx"),
  route("tags/:tag", "routes/tags.$tag.tsx"),
] satisfies RouteConfig;
