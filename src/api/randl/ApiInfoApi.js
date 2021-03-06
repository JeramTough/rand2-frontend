import {randl2HttpClient} from '../base/HttpClient'
import {randl2HttpClientV2} from "@/api/base/HttpClientV2";

const BASE = "/randlApi";

export default {

    getByPage(params, caller) {
        randl2HttpClient.get(BASE + "/page", params, caller);
    },
    getAll(params, caller) {
        randl2HttpClient.get(BASE + "/all", params, caller);
    },
    remove(params, caller) {
        randl2HttpClient.postWithParams(BASE + "/remove", params, caller);
    },
    add(data, caller) {
        randl2HttpClient.post(BASE + "/add", data, caller);
    },
    update(data, caller) {
        randl2HttpClient.post(BASE + "/update", data, caller);
    },
    byKeyword(params, caller) {
        randl2HttpClient.get(BASE + "/byKeyword", params, caller);
    },
    condition(params) {
        return randl2HttpClientV2.get(BASE + "/condition", params);
    },

};