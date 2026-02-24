<template>
  <div class="h-full">
    <fs-crud ref="crudRef" v-bind="crudBinding">
      <template v-if="title" #header-top>
        <div class="text-center text-xl font-bold pr-20">
          Manage Series: {{ title }}
        </div>
      </template>
    </fs-crud>
  </div>
</template>

<script lang="ts" setup>
import { request } from "@/service/request";
import { buildUploadFileList } from "@/utils/upload";
import { onMounted, ref } from "vue";
import { useFs, dict } from "@fast-crud/fast-crud";
import createCrudOptions from "./crud";
import { useRoute, useRouter } from "vue-router";

const title = ref("");
const router = useRouter();
const route = useRoute();
const series = ref("");

const apiPrefix = "/episode";
const context: any = {
  series,
  router,
  apiPrefix,
  columns: {
    title: {
      title: "Title",
      type: "text",
      search: { show: true },
      column: {
        width: 250,
        fixed: "left",
        component: {
          sortOrder: false,
          sorter: "default"
        }
      }
    },
    episodeLabel: {
      title: "Episode",
      type: "text",
      form: {
        show: false
      },
      column: {
        sorter: false,
        width: 100,
        formatter: (ctx: any) => {
          const ep = Number(ctx?.row?.episode);
          if (ep === 9999) return "Final";
          if (Number.isFinite(ep) && ep > 0) return `Episode ${ep}`;
          return "-";
        }
      }
    },
    episode: {
      title: "Episode",
      type: "dict-radio",
      column: {
        show: false
      },
      form: {
        value: 1
      },
      dict: dict({
        prototype: true,
        async getData(dictCtx) {
          const seriesId = dictCtx.form.series || series.value || route.query.id || "";
          const currentEpisode = dictCtx.form.episode || "";
          const url = `${apiPrefix}/dict?id=1&series=${seriesId}&currentEpisode=${currentEpisode}`;
          const res = (await request.post(url)) || {};
          const data = (res.data as []) || [];
          if (!dictCtx.form.episode && data.length > 0) {
            const firstAvailable = data.find((item: any) => !item?.disabled);
            if (firstAvailable) {
              dictCtx.form.episode = firstAvailable.value;
            }
          }
          return data;
        }
      })
    },
    series: {
      title: "Series",
      type: "dict-select",
      column: {
        width: 250
      },
      form: {
        value: series
      },
      dict: dict({
        url: `${apiPrefix}/dict`
      })
    },
    cover: {
      title: "Cover",
      type: "image-uploader",
      column: {
        width: 100
      },
      valueBuilder(ctx: any) {
        const { value, row, key } = ctx;
        row[key] = buildUploadFileList(value);
      },
      form: {
        show: false,
        component: {
          max: 1
        }
      }
    },
    description: {
      title: "Description",
      type: "textarea",
      column: {
        show: false
      }
    },
    video: {
      title: "Video",
      type: "file-uploader",
      column: {
        show: false
      },
      valueBuilder(ctx: any) {
        const { value, row, key } = ctx;
        row[key] = buildUploadFileList(value);
      },
      form: {
        component: {
          max: 1
        }
      }
    },
    pass: {
      title: "Status",
      type: "dict-switch",
      column: {
        width: 100
      },
      form: {
        value: true
      },
      dict: dict({
        data: [
          { value: true, label: "Online", color: "success" },
          { value: false, label: "Offline", color: "warning" }
        ]
      })
    },
    like: {
      title: "Likes",
      type: "number",
      column: {
        sorter: "custom",
        width: 100
      },
      form: {
        show: false,
        value: 0
      }
    },
    views: {
      title: "Views",
      type: "number",
      column: {
        sorter: "custom",
        width: 100
      },
      form: {
        show: false,
        value: 0
      }
    },
    comments: {
      title: "Comments",
      type: "number",
      column: {
        sorter: "custom",
        width: 100
      },
      form: {
        show: false,
        value: 0
      }
    }
  }
};

const { crudRef, crudBinding, crudExpose } = useFs({
  createCrudOptions,
  context
});

onMounted(() => {
  if (route.query.id) series.value = String(route.query.id);
  if (route.query.title) title.value = String(route.query.title);
  crudExpose.doRefresh();
});
</script>
