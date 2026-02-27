<template>
	<div class="h-full">
		<fs-crud ref="crudRef" v-bind="crudBinding"></fs-crud>
	</div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { buildUploadFileList } from "@/utils/upload";
import { useFs, dict } from "@fast-crud/fast-crud";
import createCrudOptions from "./crud";
import { useRouter } from "vue-router";

const router = useRouter();

const apiPrefix = "/series";
const context: any = {
	router,
	apiPrefix,
	columns: {
		// _index: {
		// 	title: "序号",
		// 	form: { show: false },
		// 	column: {
		// 		// type: "index",
		// 		align: "center",
		// 		width: "55px",
		// 		columnSetDisabled: true,
		// 		formatter: (context) => {
		// 			let index = context.index ?? 1;
		// 			return index;
		// 		},
		// 	},
		// },
		name: {
			title: "短剧名称",
			type: "text",
			column: {
				width: 200,
				fixed: "left",
				sorter: true,
				resizable: true,
			},
			search: { show: true },
			form: {
				rules: [
					{ required: true, message: "请输入短剧名称" }
				]
			}
		},

		cover: {
			title: "封面",
			type: "image-uploader",
			column: {
				width: 100,
				resizable: true,
			},
			valueBuilder(context: any) {
				const { value, row, key } = context;
				row[key] = buildUploadFileList(value);
			},
			form: {
				rules: [
					{ required: true, message: "请上传封面图片" }
				],
				component: {
					max: 1,
				},
			},
		},
		category: {
			title: "所属分类",
			type: "dict-select",
			search: { show: true },
			column: {
				width: 120,
				sorter: true,
				resizable: true,
			},
			form: {
				rules: [
					{ required: true, message: "请选择所属分类" }
				]
			},
			dict: dict({
				url: `${apiPrefix}/dict`,
			}),
		},
		season: {
			title: "第几季",
			type: "number",
			column: {
				width: 100,
				sorter: true,
				resizable: true,
			},
			form: {
				value: 1,
			},
			component: {
				min: 0,
			},
		},
		isCompleted: {
			title: "更新状态",
			type: "dict-switch",
			column: {
				width: 120,
				sorter: true,
				resizable: true,
			},
			form: {
				value: false,
			},
			dict: dict({
				data: [
					{ value: true, label: "已完结", color: "success" },
					{ value: false, label: "更新中", color: "primary" },
				],
			}),
		},
		showInBanner: {
			title: "推荐首页轮播图",
			type: "dict-switch",
			column: {
				width: 150,
				sorter: true,
				resizable: true,
			},
			form: {
				value: false,
			},
			dict: dict({
				data: [
					{ value: true, label: "展示", color: "success" },
					{ value: false, label: "不展示", color: "warning" },
				],
			}),
		},
		recommend: {
			title: "推荐首页",
			type: "dict-switch",
			column: {
				width: 120,
				sorter: true,
				resizable: true,
			},
			form: {
				value: false,
			},
			dict: dict({
				data: [
					{ value: true, label: "推荐", color: "success" },
					{ value: false, label: "不推荐", color: "warning" },
				],
			}),
		},
		pass: {
			title: "状态",
			type: "dict-switch",
			column: {
				width: 100,
				sorter: true,
				resizable: true,
			},
			form: {
				value: true,
			},
			dict: dict({
				data: [
					{ value: true, label: "上架", color: "success" },
					{ value: false, label: "下架", color: "warning" },
				],
			}),
		},
		description: {
			title: "简介",
			type: "textarea",
			column: {
				show: false,
			},
		},
	},
};

const { crudRef, crudBinding, crudExpose } = useFs({
	createCrudOptions,
	context,
});

onMounted(() => {
	crudExpose.doRefresh();
});
</script>
