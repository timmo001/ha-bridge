import { defineComponents } from "blume";
import HomeBanner from "./components/HomeBanner.astro";

export default defineComponents({
  layout: {
    PageHeader: HomeBanner,
  },
});
