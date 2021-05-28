<script>
import FileSaver from 'file-saver';
import upload from './file-upload.service'; // real service

export default {
  name: 'Products',
  data() {
    return {
      routePath: '/products',
      title: 'Products',
      textarea: '',
      bibresult: '',
      defaultCnki:
        '{Reference Type}: Journal Article\n{Title}: 计算机辅助导航技术在脊柱外科中的应用\n{Author}: 潘紫麟;刘庆鹏;\n{Author Address}: 哈尔滨医科大学附属第二医院骨科;\n{Journal}: 医学综述\n{Year}: 2021\n{Issue}: 11\n{Pages}: 2184-2188\n{Keywords}: 脊柱疾病;计算机辅助;导航技术\n{Abstract}: 随着当代计算机技术的不断发展，计算机辅助导航技术逐渐应用于脊柱外科手术中，该技术通过相关影像学信息将手术与三维立体定位、计算机影像处理、可视化技术结合，动态显示内固定物与解剖结构的相对位置，同时还可以根据不同患者病变情况计划和模拟手术，以更加精准、安全、微创地实施脊柱外科手术。目前计算机辅助导航技术已经在椎弓根螺钉置入、人工椎间盘置换、椎体成形术、脊柱肿瘤手术等方面进行临床应用。作为前沿领域，计算机辅助导航技术将推动脊柱外科手术趋于智能化、安全化、微创化、个性化，并对脊柱外科的发展起到重要作用。\n{ISBN/ISSN}: 1006-2084\n{Notes}: 11-3553/R\n{Database Provider}: CNKI\n',
    };
  },
  components: {},
  created() {},
  computed: {},
  methods: {
    save(form) {
      // upload data to the server
      let data = '';
      if (!form) data = this.defaultCnki;
      else data = form;

      upload(data)
        .then((x) => {
          this.bibresult = x;
        })
        .catch((err) => {
          throw err;
        });
    },
    onCopy() {
      alert('复制成功');
    },
    onError() {
      alert('复制失败');
    },
    downloadfile(data) {
      const blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
      FileSaver.saveAs(blob, 'citation.bib');
    },
  },
};
</script>

<template>
  <div class="content-container">
    <div>
      <textarea
        v-model="textarea"
        :placeholder="defaultCnki"
        class="input-file"
      ></textarea>
    </div>
    <button v-on:click="save(textarea)" class="bottonColor">转换成Bib</button>
    <div>
      <textarea v-model="bibresult" class="output-file"></textarea>
    </div>
    <button type="button"
      v-clipboard:copy="bibresult"
      v-clipboard:success="onCopy"
      v-clipboard:error="onError"
      class="bottonColor">复制到粘贴板</button>
    <button v-on:click="downloadfile(bibresult)" class="bottonColor">
      保存为文件
    </button>
  </div>
</template>

<style>
.input-file {
  width: 80%;
  height: 400px;
}
.output-file {
  width: 80%;
  height: 150px;
  cursor: pointer;
}
.bottonColor {
  background: lightgreen; /* when mouse over to the drop zone, change color */
  margin-bottom: 10px;
  margin-right: 20px;
}
</style>
