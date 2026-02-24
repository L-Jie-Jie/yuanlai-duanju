import type {
  CreateCrudOptionsRet,
  AddReq,
  DelReq,
  EditReq,
  UserPageQuery,
  UserPageRes,
  CreateCrudOptionsProps
} from '@fast-crud/fast-crud';
import { request } from '@/service/request';
import { normalizeUploadValue } from '@/utils/upload';

function resHandle(res: any) {
  return res.data;
}

export default function createCrudOptions({ context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
  const { apiPrefix, columns, series, router } = context;
  const pageRequest = async (query: UserPageQuery): Promise<UserPageRes> => {
    if (series.value ) {
      query.form['series'] = series.value
    }
    const res = await request.post(`${apiPrefix}/list`, query);
    const data = resHandle(res) || {};
    const records = (data.records || []).map((item: any) => ({
      ...item,
      episode: item?.episode == null ? item?.episode : String(item.episode)
    }));
    return {
      ...data,
      records
    };
  };
  const editRequest = async (ctx: EditReq) => {
    const { form } = ctx;
    const episodeValue = Number(form.episode);
    const normalizedForm = {
      ...form,
      series: form.series || series.value,
      episode: Number.isFinite(episodeValue) ? episodeValue : form.episode,
      cover: normalizeUploadValue(form.cover, true),
      video: normalizeUploadValue(form.video, true)
    };
    const res = await request.put(`${apiPrefix}/update`, normalizedForm);
    return resHandle(res);
  };
  const delRequest = async (ctx: DelReq) => {
    const { row } = ctx;
    const res = await request.delete(`${apiPrefix}/${row._id}`);
    return resHandle(res);
  };

  const addRequest = async (req: AddReq) => {
    const { form } = req;
    const episodeValue = Number(form.episode);
    const normalizedForm = {
      ...form,
      series: form.series || series.value,
      episode: Number.isFinite(episodeValue) ? episodeValue : form.episode,
      cover: normalizeUploadValue(form.cover, true),
      video: normalizeUploadValue(form.video, true)
    };
    const res = await request.post(`${apiPrefix}`, normalizedForm);
    return resHandle(res);
  };

  return {
    crudOptions: {
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest
      },
      columns,
      rowHandle: {
        fixed: 'right',
        buttons: {
          more: {
            text: null,
            icon: 'mdi:comment-text-multiple-outline',
            size: 'small',
            click:(data)=>{
              console.log("more", data.row._id);
              router.push({
                name: 'comment',
                query: {
                  id: data.row._id,
                  episode: data.row.episode,
                  seriesname: data.row.seriesname
                }
              })
            }
          }
        }
      },
    }
  };
}
