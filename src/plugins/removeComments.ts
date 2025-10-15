import type { Comment, PluginCreator, Root } from 'postcss'

const removeComments: PluginCreator<undefined> = () => ({
  postcssPlugin: 'remove-comments-except-important',
  Once(root: Root) {
    root.walkComments((comment: Comment) => {
      // Сохраняем только /*! ... */ комменты (важные для разработчика)
      if (!comment.text.trim().startsWith('!')) {
        comment.remove()
      }
    })
  },
})

removeComments.postcss = true
export default removeComments
