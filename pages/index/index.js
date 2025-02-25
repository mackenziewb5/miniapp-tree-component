//index.js
import treeData from './treeData.js' // 引入数据文件
Page({
  data: {
    types: 'add', // 用来区分新增和编辑和查看三种情况。
    treeData: treeData,
  },
  resetTree(e) {
    this.setData({
      currentCheck: e.detail.checkedItem,
      treeData: e.detail.changeList,
    })
    console.log(e, 'e')
    // 处理选中品类
    let selectedArr = this.getCheckedItemsArray(this.data.treeData)
    console.log(selectedArr, 'selectedArr')
    this.setData({
      ['tableForm.selectedCodeList']: selectedArr,
    })
  },
  /**
   * 处理勾选的数据-转换成想要的传参形式
   * @param {Array} treeData - 树结构数据
   * @param {Array} checkedItems - 勾选的节点
   * @returns {Array} - 包含勾选节点的数组
   */
  getCheckedItemsArray: function (treeData) {
    let result = []

    function processNode(node, level = 0, path = {}) {
      // 如果节点勾选，则记录路径
      if (node.selected == 1) {
        // 更新路径对象
        path[classifyNoList[level]] = node.catCode || ''
        // 记录路径
        result.push({
          ...path,
        })
      }

      // 如果节点勾选，处理完当前节点，停止继续遍历子节点
      if (node.selected == 1) {
        return
      }

      // 遍历子节点
      if (node.children) {
        node.children.forEach(child => {
          processNode(child, level + 1, {
            ...path,
            [classifyNoList[level]]: node.catCode || '',
          })
        })
      }
    }

    treeData.forEach(node => {
      processNode(node)
    })

    return result
  },

  // 筛选选中的品类
  getSelectedCode(treeData, arr = []) {
    treeData.forEach(item => {
      if (item.selected == 1) {
        if (item.children.length > 0) {
          this.getSelectedCode(item.children, arr)
        } else {
          arr.push(item.catCode)
        }
      } else {
        if (item.children.length > 0) {
          this.getSelectedCode(item.children, arr)
        }
      }
    })
    return arr
  },
})
