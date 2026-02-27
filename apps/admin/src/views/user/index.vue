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
				helper: "选填，留空则自动生成"
			}
		},
		phone: {
			title: "手机号",
			type: "text",
			search: { show: true },
			column: {
				width: 130,
				sorter: true,
				resizable: true,
			},
			form: {
				rules: [
					{ 
						required: true, 
						message: "请输入手机号",
						trigger: ['blur', 'input']
					},
					{ 
						pattern: /^1[3-9]\d{9}$/, 
						message: "请输入正确的11位手机号",
						trigger: ['blur', 'input']
					}
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
					{ 
						required: true, 
						message: "请输入密码",
						trigger: ['blur', 'input']
					}
				],
				helper: "编辑时留空则不修改密码"
			},
			editForm: {
				rules: [
					// 编辑时密码不是必填项
				],
				helper: "留空则不修改密码"
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
