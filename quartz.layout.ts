import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ImageZoom(),
  ],
  footer: Component.Footer({
    links: {},
  }),
}

// Custom sort function for frontmatter order
const sortByOrder = (f1, f2) => {
  const aOrder = f1.frontmatter?.order ?? 999
  const bOrder = b1.frontmatter?.order ?? 999

  if (aOrder !== bOrder) {
    return aOrder - bOrder
  }

  // Fall back to alphabetical by title
  const f1Title = f1.frontmatter?.title?.toLowerCase() ?? ""
  const f2Title = f2.frontmatter?.title?.toLowerCase() ?? ""
  return f1Title.localeCompare(f2Title)
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.ConditionalRender({
      component: Component.TableOfContents(),
      condition: (page) => page.fileData.frontmatter?.showToc === true,
    }),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
