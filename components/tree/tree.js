// tree.ts
//树形单选组件
Component({
  properties: {
    types:'',
    treeList: Array, // 树形数组
    treeListTemp: Array,
    currentItem: Object,
    initialSelectedCodes: Array, // 新增初始选中值的catCode数组
  },
  data: {
    treeList: [],
  },
  observers: {
    treeList: function (data) {
      if (data) {
        console.log('Data received in child component:', data)
      }
    },
  },
  attached() {
    console.log(this.data.treeList, 'this.data.treeList初始化状态前')
    console.log(this.data.types, 'types')
    // 在组件挂载到页面节点树时触发
    // 初始化树形数据
    this.initializeTreeData(this.data.treeList);
    this.setData({
      treeList: this.data.treeList,
    });
    console.log(this.data.treeList, 'this.data.treeList初始化状态后')
    // 设置初始选中状态
    console.log(this.data.initialSelectedCodes, 'this.data.initialSelectedCodes')
    this.setInitialSelectedStatus(this.data.initialSelectedCodes);

  },
  methods: {
    setInitialSelectedStatus: function (selectedCodes) {
      if (!selectedCodes || !selectedCodes.length) return;

       // 遍历树形数据设置初始选中状态
       selectedCodes.forEach(item => {
        this.setSelectedStatusByCatCode(this.data.treeList, item.currentCode);
      });

      // 更新所有父节点状态
      selectedCodes.forEach(item => {
        this.updateParentNodeStatus(this.data.treeList, item.parentCode);
      });
      this.triggerEvent(
        'resetTree', {
          changeList: this.data.treeList,
        }, {
          bubbles: true,
          composed: true,
        },
      )
    },
    setSelectedStatusByCatCode: function (list, catCode) {
      list.forEach(item => {
        if (item.catCode === catCode) {
          item.selected = 1;
          this.setChooseStatusForAll(item.children, 1);
        }
        if (item.children && item.children.length > 0) {
          this.setSelectedStatusByCatCode(item.children, catCode);
        }
      });
    },
    // updateAllParentNodeStatus: function (treeList) {
    //   treeList.forEach(item => {
    //     if (item.children && item.children.length > 0) {
    //       this.updateAllParentNodeStatus(item.children);
    //     }
    //     console.log(treeList, 'treeList')
    //     console.log(item.parentCode, 'parentCode')
    //     this.updateParentNodeStatus(treeList, item.parentCode);
    //   });
    // },
    initializeTreeData: function (list) {
      list.forEach(item => {
        // 为没有 selected 属性的节点设置初始值 0
        if (item.selected === undefined || item.selected === null) {
          item.selected = 0;
        }
        // 如果有子节点，递归初始化
        if (item.children && item.children.length > 0) {
          this.initializeTreeData(item.children);
        }
      });
    },
    /**
     * 点击标签展示子节点
     * @param e
     */
    showChildren: function (e) {
      //点击项的id
      let id = e.currentTarget.dataset.id
      // 父级id
      let parentid = e.currentTarget.dataset.parentid
      this.findCurrentItem(id, this.data.treeList)
      if (parentid == null || parentid == '') {
        this.setData({
          treeListTemp: this.data.treeList,
        })
      } else {
        this.hanleStatusChange(this.data.treeListTemp, parentid)
        this.setData({
          treeListTemp: this.data.treeListTemp,
        })
      }
      this.triggerEvent(
        'resetTree', {
          changeList: this.data.treeListTemp,
        }, {
          bubbles: true,
          composed: true,
        },
      )
    },

    /**
     * 设置折叠状态
     * @param list 处理集合
     * @param parentid 父级id
     */
    hanleStatusChange: function (list, parentid) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].catCode == parentid) {
          list[i].children = this.data.treeList
          break
        } else {
          if (list[i].children) {
            this.hanleStatusChange(list[i].children, parentid)
          }
        }
      }
    },

    /**
     * 功能类型 collapse：点击标签展开收起
     * */
    findCurrentItem: function (id, list) {
      list.forEach(it => {
        if (it.id == id) {
          it.collapse = !it.collapse
        } else {
          if (it.children) {
            this.findCurrentItem(id, it.children)
          }
        }
      })
    },

    /**
     * 点击选择框
     * @param e 节点
     */
    handleClick: function (e) {
      console.log(this.data.types,'点击')
      let checkedItem = e.currentTarget.dataset.currentitem
      this.setChooseStatus(checkedItem.id, this.data.treeListTemp)
      if (checkedItem.selected == 1) {
        checkedItem.selected = 0
      } else if (checkedItem.selected == 0 || checkedItem.selected == undefined) {
        checkedItem.selected = 1
      }
      // 递归检查父节点状态
      this.updateParentNodeStatus(this.data.treeListTemp, checkedItem.parentCode)

      this.setData({
        treeListTemp: this.data.treeListTemp,
      })
      this.triggerEvent(
        'resetTree', {
          changeList: this.data.treeListTemp,
          checkedItem: checkedItem,
        }, {
          bubbles: true,
          composed: true,
        },
      )
    },
    // 递归更新父节点状态
    updateParentNodeStatus: function (treeList, parentCode) {
     
      if (parentCode == null) return;

      let parentNode = null;

      // 遍历整个树，找到 parentCode 对应的节点
      function findParentNode(list) {
        for (let node of list) {
          if (node.catCode === parentCode) {
            parentNode = node;
            return;
          }
          if (node.children && node.children.length > 0) {
            findParentNode(node.children);
            if (parentNode) return;
          }
        }
      }

      findParentNode(treeList);
      if (parentNode) {
        console.log(parentNode, 'parentNode遍历父结点')
        console.log(parentNode, 'parentNode')
        const allSelected = parentNode.children.every(child => child.selected === 1);
        const allUnselected = parentNode.children.every(child => child.selected === 0);
        if (allSelected) {
          parentNode.selected = 1;
        } else if (allUnselected) {
          parentNode.selected = 0;
        } else {
          parentNode.selected = 2;
        }
        // 递归更新上一级父节点的状态
        this.updateParentNodeStatus(treeList, parentNode.parentCode);
      }
    },

    /**
     * 设置选中状态
     * @param id 选中项的id
     */
    setChooseStatus(id, list) {
      list.forEach(el => {
        if (el.id == id) {
          if (el.selected == 1) {
            el.selected = 0
          } else {
            el.selected = 1
          }
          this.setChooseStatusForAll(el.children, el.selected)
        } else {
          // el.selected = false;
          if (el.children) {
            this.setChooseStatus(id, el.children)
          }
        }
      })
    },
    /**
     * 勾选设置子节点状态
     * @param {所有子节点数组} childrenList
     * @param {需要设置的选中状态} selected
     */
    setChooseStatusForAll(childrenList, selected) {
      childrenList.forEach(item => {
        item.selected = selected
        if (item.children.length > 0) {
          this.setChooseStatusForAll(item.children, selected)
        }
      })
    },
  },
})