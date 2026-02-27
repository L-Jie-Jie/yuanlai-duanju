<template>
	<div class="h-full">
		<fs-crud ref="crudRef" v-bind="crudBinding"></fs-crud>
	</div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useFs, dict } from "@fast-crud/fast-crud";
import createCrudOptions from "@/views/crud";
const apiPrefix = "/user";
const context: any = {
	apiPrefix,
	columns: {
		username: {
			title: "用户名",
			type: "text",
			search: { show: true },
			column: {
				width: 150,
				sorter: true,
				resizable: true,
			},
			form: {
				rules: [
					{ required: true, message: "请输入用户名" }
				]
			}
		},
		password: {
			title: "密码",
			type: "text",
			column: {
				show: false,
			},
			form: {
				rules: [
					{ required: true, message: "请输入密码" }
				]
			}
		},
		avatar: {
			title: "头像",
			type: "cropper-uploader",
			column: {
				width: 100,
				resizable: true,
			},
		},
		pass: {
			title: "状态",
			search: { show: true },
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
					{ value: true, label: "正常", color: "success" },
					{ value: false, label: "禁用", color: "warning" },
				],
			}),
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
