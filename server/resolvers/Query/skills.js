import { Classes, Skills } from '/imports/api/collections'

export function skills() {
  const classes = Classes.find({}).fetch()
  const skillz = Skills.find({})
    .fetch()
    .map(skill => {
      const populatedClasses = skill.classes.map(classId =>
        classes.find(clazz => clazz._id === classId)
      )
      return {
        ...skill,
        classes: populatedClasses,
      }
    })

  return skillz
}
